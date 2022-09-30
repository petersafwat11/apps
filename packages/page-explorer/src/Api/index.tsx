// Copyright 2017-2022 @polkadot/app-explorer authors & contributors
// SPDX-License-Identifier: Apache-2.0
import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { curveCardinal } from 'd3-shape';


import type { Stats } from '@polkadot/react-components/ApiStats/types';

import { useContext, useMemo } from 'react';
import styled from 'styled-components';

import { ApiStatsContext, CardSummary, Spinner, SummaryBox } from '@polkadot/react-components';
import { formatNumber } from '@polkadot/util';

import Chart from '../Latency/Chart';
import { useTranslation } from '../translate';

interface Props {
  className?: string;
}
interface requestsChart1 {
  request : number,
  subscribe: number,
  total: number,
  avarage: number
}
interface ChartContents {
  labels: string[];
  values: number[][];
}

interface ChartInfo {
  bytesChart: ChartContents;
  errorsChart: ChartContents;
  requestsChart: ChartContents;
}

// const COLORS_ERRORS = ['#8c0044', '#acacac'];

const COLORS_BYTES = ['#00448c', '#008c44', '#acacac'];
const COLORS_REQUESTS = ['#008c8c', '#00448c', '#8c4400', '#acacac'];

function getPoints (all: Stats[]): ChartInfo {
  const bytesChart: ChartContents = {
    labels: [],
    values: [[], [], []]
  };
  const errorsChart: ChartContents = {
    labels: [],
    values: [[]]
  };
  const requestsChart: ChartContents = {
    labels: [],
    values: [[], [], [], []]
  };
  const requestsChart1 :{request :number ,
  subscribe: number,
  total: number,
  date:string,
  avarage:number}[]=[];

   const transferChart: {prevRecv :number ,
  recvAvg: number,
  prevSent: number,
  date:string,
  }[] 
   =[];

  const reqBase = all.reduce((a, { stats: { active: { requests, subscriptions } } }) => a + requests + subscriptions, 0);
  let { bytesRecv: prevRecv, bytesSent: prevSent, errors: prevErrors } = all[0].stats.total;
  let recvTotal = 0;

  for (let i = 1; i < all.length; i++) {
    const { stats: { active: { requests: aReq, subscriptions: aSub }, total: { bytesRecv, bytesSent, errors } }, when } = all[i];

    const time = new Date(when).toLocaleTimeString();

    bytesChart.labels.push(time);
    bytesChart.values[0].push(bytesSent - prevSent);
    bytesChart.values[1].push(bytesRecv - prevRecv);

    errorsChart.labels.push(time);
    errorsChart.values[0].push(errors - prevErrors);

    requestsChart.labels.push(time);
    requestsChart.values[0].push(aReq + aSub);
    requestsChart.values[1].push(aReq);
    requestsChart.values[2].push(aSub);
    requestsChart.values[3].push(reqBase / all.length);
     requestsChart1.push({  request :aReq ,
  subscribe: aSub,
  total: aReq + aSub,
  date : time,
  avarage:reqBase / all.length
}) 
    recvTotal += bytesRecv - prevRecv;
    prevErrors = errors;
    prevRecv = bytesRecv;
    prevSent = bytesSent;
    transferChart.push({date: time,prevRecv : bytesSent,
    prevSent :bytesRecv ,recvAvg : recvTotal / (all.length - 1)
})
  }
  const recvAvg = recvTotal / (all.length - 1);

  for (let i = 1; i < all.length; i++) {
    bytesChart.values[2].push(recvAvg);
  }

  return { bytesChart, errorsChart, requestsChart,requestsChart1,transferChart };
}

function Api ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const stats = useContext(ApiStatsContext);

  const { bytesLegend, requestsLegend } = useMemo(
    () => ({
      bytesLegend: [t<string>('sent'), t<string>('recv'), t<string>('average')],
      errorsLegend: [t<string>('errors')],
      requestsLegend: [t<string>('total'), t<string>('requests'), t<string>('subscriptions'), t<string>('average')]
    }), [t]
  );

  const { bytesChart, requestsChart,requestsChart1,transferChart } = useMemo(
    () => getPoints(stats),
    [stats]
  );

  if (stats.length <= 3) {
    return <Spinner />;
  }

  const { stats: { total: { bytesRecv, bytesSent, requests: tReq, subscriptions: tSub } } } = stats[stats.length - 1];
const cardinal = curveCardinal.tension(0.2);

  return (
    <div className={className}>
      <SummaryBox>
        <section>
          <CardSummary label={t<string>('sent')}>{formatNumber(bytesSent / 1024)}kB</CardSummary>
          <CardSummary label={t<string>('recv')}>{formatNumber(bytesRecv / 1024)}kB</CardSummary>
        </section>
        <section>
          <CardSummary label={t<string>('total req')}>{formatNumber(tReq)}</CardSummary>
          <CardSummary label={t<string>('total sub')}>{formatNumber(tSub)}</CardSummary>
        </section>
      </SummaryBox>
      <div>
        <ResponsiveContainer width="100%" height={200}>
    <AreaChart
      width={500}
      height={400}
      data={requestsChart1}
      margin={{
        top: 10,
        right: 30,
        left: 0,
        bottom: 0
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip/>
      <Area
        type="monotone"
        dataKey="total"
        stroke="#82ca9d"
        fill="#82ca9d"
        fillOpacity={0.3}
      />
      <Area
        type='monotone'
        dataKey="subscribe"
        stroke="#8884d8"
        fill="#8884d8"
        fillOpacity={0.3}
      />
      <Area
        type='monotone'
        dataKey="avarage"
        stroke="#545455"
        fill="#919396"
        fillOpacity={0.3}
      />
        <Area
        type='monotone'
        dataKey="request"
        stroke="#0A437D"
        fill="#1A77D4"

        fillOpacity={0.3}
      />
    </AreaChart>
        </ResponsiveContainer>
      </div>
{/* 
      <Chart
        colors={COLORS_BYTES}
        legends={bytesLegend}
        title={t<string>('transfer')}
        value={bytesChart}
      /> */}
            <div>
        <ResponsiveContainer width="100%" height={200}>
    <AreaChart
      width={500}
      height={400}
      data={transferChart}
      margin={{
        top: 10,
        right: 30,
        left: 0,
        bottom: 0
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip/>
      <Area
        type="monotone"
        dataKey="prevRecv"
        stroke="#8884d8"
        fill="#8884d8"
        fillOpacity={0.3}
      />
      <Area
        type='monotone'
        dataKey="prevSent"
        stroke="#82ca9d"
        fill="#82ca9d"
        fillOpacity={0.3}
      />
      <Area
        type='monotone'
        dataKey="recvAvg"
        stroke="#0A437D"
        fill="#1A77D4"
        fillOpacity={0.3}
      />
    </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default React.memo(styled(Api)`
  .container {
    background: var(--bg-table);
    border: 1px solid var(--border-table);
    border-radius: 0.25rem;
    padding: 1rem 1.5rem;
  }

  .container+.container {
    margin-top: 1rem;
  }
`);







