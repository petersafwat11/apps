// Copyright 2017-2022 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveReferendumExt } from '@polkadot/api-derive/types';

import React from 'react';

import { Button } from '@polkadot/react-components';
import { useApi, useCall, useToggle } from '@polkadot/react-hooks';

import { useTranslation } from '../translate';
import Externals from './Externals';
import PreImage from './PreImage';
import Proposals from './Proposals';
import Propose from './Propose';
import Referendums from './Referendums';
import Summary from './Summary';
import styled from 'styled-components';

interface Props {
  className?: string;
}

function Overview ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const [isPreimageOpen, togglePreimage] = useToggle();
  const [isProposeOpen, togglePropose] = useToggle();
  const referendums = useCall<DeriveReferendumExt[]>(api.derive.democracy.referendums);

  return (
    <div className={className}>
      <Summary referendumCount={referendums?.length} />
      <div className='button-group'>
      <Button.Group>
        <Button
          icon='plus'
          label={t<string>('Submit preimage')}
          onClick={togglePreimage}
        />
        <Button
          icon='plus'
          label={t<string>('Submit proposal')}
          onClick={togglePropose}
        />
      </Button.Group>
      </div>
      {isPreimageOpen && (
        <PreImage onClose={togglePreimage} />
      )}
      {isProposeOpen && (
        <Propose onClose={togglePropose} />
      )}
      <div className='content'>
      <Referendums referendums={referendums} />
      <Proposals />
      <Externals />
      </div>
    </div>
  );
}

export default React.memo(styled(Overview)`
.button-group{ 
  display: flex;
   justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px; }
`);