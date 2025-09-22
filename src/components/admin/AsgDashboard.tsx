import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AsgCapacityRequest,
  AsgDashboardOverview,
  AsgDetails,
  AsgListResponse,
  InstanceInfo,
  OperationResponse,
} from '../type/index';
import { serverAPI } from '../service/apiService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Loader2,
  Network,
  Server,
  Trash2,
} from 'lucide-react';

type FeedbackState = {
  type: 'success' | 'error';
  message: string;
};


const statusVariantMap: Record<'healthy' | 'warning' | 'critical', 'default' | 'secondary' | 'destructive'> = {
  healthy: 'secondary',
  warning: 'default',
  critical: 'destructive',
};

const lifecycleVariantMap: Record<AsgDetails['status'], 'default' | 'secondary' | 'destructive'> = {
  InService: 'secondary',
  Updating: 'default',
  Deleting: 'destructive',
};

const lifecycleLabelMap: Record<AsgDetails['status'], string> = {
  InService: 'In Service',
  Updating: 'Updating',
  Deleting: 'Deleting',
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '알 수 없는 오류가 발생했습니다.';
};

export function AsgDashboard() {
  const [overview, setOverview] = useState<AsgDashboardOverview | null>(null);
  const [asgList, setAsgList] = useState<AsgListResponse['autoScalingGroups']>([]);
  const [selectedAsgName, setSelectedAsgName] = useState<string | null>(null);
  const [selectedAsg, setSelectedAsg] = useState<AsgDetails | null>(null);
  const [instances, setInstances] = useState<InstanceInfo[]>([]);
  const [capacityForm, setCapacityForm] = useState<AsgCapacityRequest>({});

  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const summaryItems = useMemo(() => {
    if (!overview) {
      return [];
    }

    return [
      {
        label: '전체 ASG',
        value: overview.summary.totalAsgCount.toString(),
        icon: Server,
      },
      {
        label: '전체 인스턴스',
        value: overview.summary.totalInstances.toString(),
        icon: Activity,
      },
      {
        label: '정상 인스턴스',
        value: overview.summary.healthyInstances.toString(),
        icon: CheckCircle2,
      },
    ];
  }, [overview]);


  const loadDetails = useCallback(
    async (asgName: string) => {
      setDetailLoading(true);
      setError(null);

      try {
        const [detailsData, instancesData] = await Promise.all([
          serverAPI.getAsgDetails(asgName),
          serverAPI.getAsgInstances(asgName),
        ]);

        setSelectedAsgName(asgName);
        setSelectedAsg(detailsData);
        setInstances(instancesData.instances);
        setCapacityForm({
          desired: detailsData.desiredCapacity,
          min: detailsData.minSize,
          max: detailsData.maxSize,
        });
      } catch (loadError) {
        console.error(loadError);
        setFeedback({
          type: 'error',
          message: `ASG 상세 정보를 가져오지 못했습니다: ${getErrorMessage(loadError)}`,
        });
      } finally {
        setDetailLoading(false);
      }
    },
    []
  );

  const loadOverviewAndList = useCallback(
    async (focusAsgName?: string | null) => {
      setRefreshing(true);
      setError(null);

      try {
        const [overviewData, listData] = await Promise.all([
          serverAPI.getAsgDashboardOverview(),
          serverAPI.listAsgGroups(),
        ]);

        setOverview(overviewData);
        setAsgList(listData.autoScalingGroups || []);

        const availableNames = listData.autoScalingGroups?.map(
          (group) => group.autoScalingGroupName
        ) || [];

        if (availableNames.length === 0) {
          setSelectedAsg(null);
          setSelectedAsgName(null);
          setInstances([]);
          return;
        }

        let nextSelection = focusAsgName;
        if (!nextSelection || !availableNames.includes(nextSelection)) {
          nextSelection = availableNames[0];
        }

        await loadDetails(nextSelection);
      } catch (loadError) {
        console.error(loadError);
        setError(`ASG 데이터를 불러오지 못했습니다: ${getErrorMessage(loadError)}`);
      } finally {
        setRefreshing(false);
        setInitialLoading(false);
      }
    },
    [loadDetails]
  );

  useEffect(() => {
    loadOverviewAndList();
  }, [loadOverviewAndList]);

  const handleRefresh = async () => {
    if (refreshing) {
      return;
    }
    await loadOverviewAndList(selectedAsgName);
  };

  const handleSelectAsg = async (asgName: string) => {
    if (asgName === selectedAsgName) {
      return;
    }
    await loadDetails(asgName);
  };

  const handleUpdateCapacity = async () => {
    if (!selectedAsgName) {
      return;
    }

    setUpdateLoading(true);
    setFeedback(null);

    const payload: AsgCapacityRequest = {
      desired: capacityForm.desired,
      min: capacityForm.min,
      max: capacityForm.max,
    };

    try {
      const response = await serverAPI.updateAsgCapacity(
        selectedAsgName,
        payload
      );
      handleOperationFeedback(response, `${selectedAsgName} 용량을 갱신했습니다.`);
      await loadOverviewAndList(selectedAsgName);
    } catch (updateError) {
      console.error(updateError);
      setFeedback({
        type: 'error',
        message: `용량 갱신 실패: ${getErrorMessage(updateError)}`,
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteAsg = async () => {
    if (!selectedAsgName) {
      return;
    }

    setDeleteLoading(true);
    setFeedback(null);

    try {
      const response = await serverAPI.deleteAsg(selectedAsgName);
      handleOperationFeedback(response, `${selectedAsgName} 을(를) 삭제했습니다.`);
      await loadOverviewAndList();
    } catch (deleteError) {
      console.error(deleteError);
      setFeedback({
        type: 'error',
        message: `삭제 실패: ${getErrorMessage(deleteError)}`,
      });
    } finally {
      setDeleteLoading(false);
    }
  };


  const handleOperationFeedback = (response: OperationResponse, fallbackMessage: string) => {
    if (response.status === 'success') {
      setFeedback({ type: 'success', message: response.message || fallbackMessage });
    } else if (response.status === 'pending') {
      setFeedback({ type: 'success', message: response.message || fallbackMessage });
    } else {
      setFeedback({ type: 'error', message: response.message || fallbackMessage });
    }
  };

  const renderStatusBadge = (status: 'healthy' | 'warning' | 'critical') => (
    <Badge variant={statusVariantMap[status]} className="capitalize">
      {status}
    </Badge>
  );

  const renderLifecycleBadge = (status: AsgDetails['status']) => (
    <Badge variant={lifecycleVariantMap[status]}>{lifecycleLabelMap[status]}</Badge>
  );

  const renderContent = () => {
    if (initialLoading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>ASG 데이터를 불러올 수 없습니다.</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-6">
        {feedback && (
          <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'}>
            {feedback.type === 'error' ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <AlertTitle>{feedback.type === 'error' ? '실패' : '성공'}</AlertTitle>
            <AlertDescription>{feedback.message}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">오토스케일링 대시보드</h2>
            <p className="text-sm text-muted-foreground">
              Auto Scaling Group 상태를 한눈에 확인하고 용량을 조정합니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              {refreshing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              새로고침
            </Button>
          </div>
        </div>

        {summaryItems.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            {summaryItems.map((item) => (
              <Card key={item.label}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-2xl font-semibold">{item.value}</p>
                  </div>
                  <item.icon className="h-8 w-8 text-primary" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Auto Scaling Groups</span>
                <span className="text-xs text-muted-foreground">
                  {asgList.length} 개의 그룹
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[420px]">
                <Table>
                  <TableHeader>
                    <TableRow className="sticky top-0 bg-background">
                      <TableHead>이름</TableHead>
                      <TableHead>환경</TableHead>
                      <TableHead>서버 그룹</TableHead>
                      <TableHead className="text-right">용량</TableHead>
                      <TableHead className="text-right">상태</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {asgList.map((group) => {
                      const isSelected = group.autoScalingGroupName === selectedAsgName;
                      return (
                        <TableRow
                          key={group.autoScalingGroupName}
                          className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                            isSelected ? 'bg-muted' : ''
                          }`}
                          onClick={() => handleSelectAsg(group.autoScalingGroupName)}
                        >
                          <TableCell className="font-medium">
                            {group.autoScalingGroupName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="uppercase">
                              {group.environment}
                            </Badge>
                          </TableCell>
                          <TableCell className="uppercase">{group.serverGroup}</TableCell>
                          <TableCell className="text-right">
                            <div className="space-y-0.5 text-sm">
                              <div>
                                <span className="font-medium">D:</span> {group.desiredCapacity}
                              </div>
                              <div className="text-muted-foreground">
                                <span className="font-medium">{group.instanceCount}</span> 인스턴스 /{' '}
                                <span className="font-medium">{group.healthyInstances}</span> 정상
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {renderStatusBadge(
                              group.healthyInstances === 0
                                ? 'critical'
                                : group.healthyInstances < group.instanceCount
                                ? 'warning'
                                : 'healthy'
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>선택한 ASG</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {detailLoading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {!detailLoading && !selectedAsg && (
                <p className="text-sm text-muted-foreground">선택된 ASG가 없습니다.</p>
              )}

              {!detailLoading && selectedAsg && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{selectedAsg.autoScalingGroupName}</span>
                      {renderLifecycleBadge(selectedAsg.status)}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Cpu className="h-3 w-3" />
                        {selectedAsg.desiredCapacity} desired
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Network className="h-3 w-3" />
                        min {selectedAsg.minSize} / max {selectedAsg.maxSize}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">환경</span>
                      <Badge variant="outline" className="uppercase">
                        {selectedAsg.environment}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">서버 그룹</span>
                      <span className="font-medium uppercase">{selectedAsg.serverGroup}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">서브넷</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedAsg.subnetIds?.map((subnet) => (
                          <Badge key={subnet} variant="outline">
                            {subnet}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">가용 영역</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedAsg.availabilityZones?.map((zone) => (
                          <Badge key={zone} variant="outline">
                            {zone}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {selectedAsg.launchTemplate && (
                      <div className="rounded-md border p-3 text-xs text-muted-foreground">
                        <div className="font-semibold text-foreground">Launch Template</div>
                        <div>ID: {selectedAsg.launchTemplate.id}</div>
                        <div>Version: {selectedAsg.launchTemplate.version}</div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">용량 조정</h3>
                    <div className="grid gap-2 md:grid-cols-3">
                      <div>
                        <Label htmlFor="capacity-desired">Desired</Label>
                        <Input
                          id="capacity-desired"
                          type="number"
                          min={0}
                          max={20}
                          value={capacityForm.desired?.toString() ?? ''}
                          onChange={(event) =>
                            setCapacityForm((prev) => ({
                              ...prev,
                              desired: event.target.value === '' ? undefined : Number(event.target.value),
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="capacity-min">Min</Label>
                        <Input
                          id="capacity-min"
                          type="number"
                          min={0}
                          max={20}
                          value={capacityForm.min?.toString() ?? ''}
                          onChange={(event) =>
                            setCapacityForm((prev) => ({
                              ...prev,
                              min: event.target.value === '' ? undefined : Number(event.target.value),
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="capacity-max">Max</Label>
                        <Input
                          id="capacity-max"
                          type="number"
                          min={1}
                          max={20}
                          value={capacityForm.max?.toString() ?? ''}
                          onChange={(event) =>
                            setCapacityForm((prev) => ({
                              ...prev,
                              max: event.target.value === '' ? undefined : Number(event.target.value),
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={handleUpdateCapacity} disabled={updateLoading}>
                        {updateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        용량 업데이트
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAsg}
                        disabled={deleteLoading}
                      >
                        {deleteLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>인스턴스</span>
              <Badge variant="outline">{instances.length} 개</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[360px]">
              <Table>
                <TableHeader>
                  <TableRow className="sticky top-0 bg-background">
                    <TableHead>ID</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>헬스</TableHead>
                    <TableHead>가용 영역</TableHead>
                    <TableHead>Launch Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {instances.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                        표시할 인스턴스가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                  {instances.map((instance) => (
                    <TableRow key={instance.instanceId}>
                      <TableCell className="font-mono text-xs">
                        {instance.instanceId}
                      </TableCell>
                      <TableCell className="text-sm">
                        <Badge variant="outline">{instance.lifecycleState}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={instance.healthStatus === 'Healthy' ? 'secondary' : 'destructive'}
                        >
                          {instance.healthStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {instance.availabilityZone}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(instance.launchTime).toLocaleString('ko-KR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">{renderContent()}</CardContent>
      </Card>
    </div>
  );
}
