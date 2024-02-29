/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

const CreateSuffix = ':create';
const UpdateSuffix = ':update';
const ReadSuffix = ':read';
const DeleteSuffix = ':delete';

// Used when the "normal" permission (ex. 'read') allows access only to specific resources, while the  '-all' allows access to all resources
const ReadAllSuffix = ReadSuffix + '-all';
const UpdateAllSuffix = UpdateSuffix + '-all';

export class Permissions {
  private static readonly DomainOfInfluencePrefix = 'DomainOfInfluence';
  public static readonly DomainOfInfluence = {
    Create: Permissions.DomainOfInfluencePrefix + CreateSuffix,
    UpdateAll: Permissions.DomainOfInfluencePrefix + UpdateAllSuffix,
    Update: Permissions.DomainOfInfluencePrefix + UpdateSuffix,
    Read: Permissions.DomainOfInfluencePrefix + ReadSuffix,
    ReadAll: Permissions.DomainOfInfluencePrefix + ReadAllSuffix,
    Delete: Permissions.DomainOfInfluencePrefix + DeleteSuffix,
  };

  private static readonly DomainOfInfluenceHierarchyPrefix = 'DomainOfInfluence.Hierarchy';
  public static readonly DomainOfInfluenceHierarchy = {
    Read: Permissions.DomainOfInfluenceHierarchyPrefix + ReadSuffix,
    ReadAll: Permissions.DomainOfInfluenceHierarchyPrefix + ReadAllSuffix,
    Update: Permissions.DomainOfInfluenceHierarchyPrefix + UpdateSuffix,
  };

  private static readonly DomainOfInfluenceLogoPrefix = 'DomainOfInfluence.Logo';
  public static readonly DomainOfInfluenceLogo = {
    Read: Permissions.DomainOfInfluenceLogoPrefix + ReadSuffix,
    Update: Permissions.DomainOfInfluenceLogoPrefix + UpdateSuffix,
    Delete: Permissions.DomainOfInfluenceLogoPrefix + DeleteSuffix,
  };

  private static readonly CantonSettingsPrefix = 'CantonSettings';
  public static readonly CantonSettings = {
    Create: Permissions.CantonSettingsPrefix + CreateSuffix,
    Update: Permissions.CantonSettingsPrefix + UpdateSuffix,
    Read: Permissions.CantonSettingsPrefix + ReadSuffix,
    ReadAll: Permissions.CantonSettingsPrefix + ReadAllSuffix,
  };

  private static readonly CountingCirclePrefix = 'CountingCircle';
  public static readonly CountingCircle = {
    Create: Permissions.CountingCirclePrefix + CreateSuffix,
    Update: Permissions.CountingCirclePrefix + UpdateSuffix,
    UpdateAll: Permissions.CountingCirclePrefix + UpdateAllSuffix,
    Read: Permissions.CountingCirclePrefix + ReadSuffix,
    ReadAll: Permissions.CountingCirclePrefix + ReadAllSuffix,
    Delete: Permissions.CountingCirclePrefix + DeleteSuffix,
    Merge: Permissions.CountingCirclePrefix + ':merge',
  };

  private static readonly ContestPrefix = 'Contest';
  public static readonly Contest = {
    Create: Permissions.ContestPrefix + CreateSuffix,
    Update: Permissions.ContestPrefix + UpdateSuffix,
    Read: Permissions.ContestPrefix + ReadSuffix,
    ReadAll: Permissions.ContestPrefix + ReadAllSuffix,
    Delete: Permissions.ContestPrefix + DeleteSuffix,
  };

  private static readonly VotePrefix = 'Vote';
  public static readonly Vote = {
    Create: Permissions.VotePrefix + CreateSuffix,
    Update: Permissions.VotePrefix + UpdateSuffix,
    Read: Permissions.VotePrefix + ReadSuffix,
    Delete: Permissions.VotePrefix + DeleteSuffix,
  };

  private static readonly VoteBallotPrefix = 'VoteBallot';
  public static readonly VoteBallot = {
    Create: Permissions.VoteBallotPrefix + CreateSuffix,
    Update: Permissions.VoteBallotPrefix + UpdateSuffix,
    Read: Permissions.VoteBallotPrefix + ReadSuffix,
    Delete: Permissions.VoteBallotPrefix + DeleteSuffix,
  };

  private static readonly ProportionalElectionPrefix = 'ProportionalElection';
  public static readonly ProportionalElection = {
    Create: Permissions.ProportionalElectionPrefix + CreateSuffix,
    Update: Permissions.ProportionalElectionPrefix + UpdateSuffix,
    Read: Permissions.ProportionalElectionPrefix + ReadSuffix,
    Delete: Permissions.ProportionalElectionPrefix + DeleteSuffix,
  };

  private static readonly ProportionalElectionListPrefix = 'ProportionalElection.List';
  public static readonly ProportionalElectionList = {
    Create: Permissions.ProportionalElectionListPrefix + CreateSuffix,
    Update: Permissions.ProportionalElectionListPrefix + UpdateSuffix,
    Read: Permissions.ProportionalElectionListPrefix + ReadSuffix,
    Delete: Permissions.ProportionalElectionListPrefix + DeleteSuffix,
  };

  private static readonly ProportionalElectionListUnionPrefix = 'ProportionalElection.ListUnion';
  public static readonly ProportionalElectionListUnion = {
    Create: Permissions.ProportionalElectionListUnionPrefix + CreateSuffix,
    Update: Permissions.ProportionalElectionListUnionPrefix + UpdateSuffix,
    Read: Permissions.ProportionalElectionListUnionPrefix + ReadSuffix,
    Delete: Permissions.ProportionalElectionListUnionPrefix + DeleteSuffix,
  };

  private static readonly ProportionalElectionCandidatePrefix = 'ProportionalElection.Candidate';
  public static readonly ProportionalElectionCandidate = {
    Create: Permissions.ProportionalElectionCandidatePrefix + CreateSuffix,
    Update: Permissions.ProportionalElectionCandidatePrefix + UpdateSuffix,
    Read: Permissions.ProportionalElectionCandidatePrefix + ReadSuffix,
    Delete: Permissions.ProportionalElectionCandidatePrefix + DeleteSuffix,
  };

  private static readonly ProportionalElectionUnionPrefix = 'ProportionalElection.Union';
  public static readonly ProportionalElectionUnion = {
    Create: Permissions.ProportionalElectionUnionPrefix + CreateSuffix,
    Update: Permissions.ProportionalElectionUnionPrefix + UpdateSuffix,
    Read: Permissions.ProportionalElectionUnionPrefix + ReadSuffix,
    Delete: Permissions.ProportionalElectionUnionPrefix + DeleteSuffix,
  };

  private static readonly MajorityElectionPrefix = 'MajorityElection';
  public static readonly MajorityElection = {
    Create: Permissions.MajorityElectionPrefix + CreateSuffix,
    Update: Permissions.MajorityElectionPrefix + UpdateSuffix,
    Read: Permissions.MajorityElectionPrefix + ReadSuffix,
    Delete: Permissions.MajorityElectionPrefix + DeleteSuffix,
  };

  private static readonly MajorityElectionCandidatePrefix = 'MajorityElection.Candidate';
  public static readonly MajorityElectionCandidate = {
    Create: Permissions.MajorityElectionCandidatePrefix + CreateSuffix,
    Update: Permissions.MajorityElectionCandidatePrefix + UpdateSuffix,
    Read: Permissions.MajorityElectionCandidatePrefix + ReadSuffix,
    Delete: Permissions.MajorityElectionCandidatePrefix + DeleteSuffix,
  };

  private static readonly MajorityElectionBallotGroupPrefix = 'MajorityElection.BallotGroup';
  public static readonly MajorityElectionBallotGroup = {
    Create: Permissions.MajorityElectionBallotGroupPrefix + CreateSuffix,
    Update: Permissions.MajorityElectionBallotGroupPrefix + UpdateSuffix,
    Read: Permissions.MajorityElectionBallotGroupPrefix + ReadSuffix,
    Delete: Permissions.MajorityElectionBallotGroupPrefix + DeleteSuffix,
  };

  private static readonly MajorityElectionUnionPrefix = 'MajorityElection.Union';
  public static readonly MajorityElectionUnion = {
    Create: Permissions.MajorityElectionUnionPrefix + CreateSuffix,
    Update: Permissions.MajorityElectionUnionPrefix + UpdateSuffix,
    Read: Permissions.MajorityElectionUnionPrefix + ReadSuffix,
    Delete: Permissions.MajorityElectionUnionPrefix + DeleteSuffix,
  };

  private static readonly SecondaryMajorityElectionPrefix = 'SecondaryMajorityElection';
  public static readonly SecondaryMajorityElection = {
    Create: Permissions.SecondaryMajorityElectionPrefix + CreateSuffix,
    Update: Permissions.SecondaryMajorityElectionPrefix + UpdateSuffix,
    Read: Permissions.SecondaryMajorityElectionPrefix + ReadSuffix,
    Delete: Permissions.SecondaryMajorityElectionPrefix + DeleteSuffix,
  };

  private static readonly SecondaryMajorityElectionCandidatePrefix = 'SecondaryMajorityElection.Candidate';
  public static readonly SecondaryMajorityElectionCandidate = {
    Create: Permissions.SecondaryMajorityElectionCandidatePrefix + CreateSuffix,
    Update: Permissions.SecondaryMajorityElectionCandidatePrefix + UpdateSuffix,
    Read: Permissions.SecondaryMajorityElectionCandidatePrefix + ReadSuffix,
    Delete: Permissions.SecondaryMajorityElectionCandidatePrefix + DeleteSuffix,
  };

  private static readonly ElectionGroupPrefix = 'ElectionGroup';
  public static readonly ElectionGroup = {
    Update: Permissions.ElectionGroupPrefix + UpdateSuffix,
    Read: Permissions.ElectionGroupPrefix + ReadSuffix,
    ReadAll: Permissions.ElectionGroupPrefix + ReadAllSuffix,
  };

  private static readonly EventLogPrefix = 'EventLog';
  public static readonly EventLog = {
    Read: Permissions.EventLogPrefix + ReadSuffix,
    ReadAll: Permissions.EventLogPrefix + ReadAllSuffix,
  };

  private static readonly ImportPrefix = 'Import';
  public static readonly Import = {
    ImportData: Permissions.ImportPrefix + ':import',
  };

  private static readonly ExportPrefix = 'Export';
  public static readonly Export = {
    ExportData: Permissions.ExportPrefix + ':export',
    ExportAllPoliticalBusinesses: Permissions.ExportPrefix + ':export-all-political-businesses',
  };
}
