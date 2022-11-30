/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { PoliticalBusinessType } from './political-business.model';

export type SecondaryElection = {
  type: PoliticalBusinessType;
  primaryElectionId: string;
};

export function newSecondaryElection(): SecondaryElection {
  return {
    type: PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_MAJORITY_ELECTION,
    primaryElectionId: '',
  };
}
