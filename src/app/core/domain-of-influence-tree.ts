/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { EnumItemDescription, EnumUtil, Tree, TreeNode } from '@abraxas/voting-lib';
import { DomainOfInfluence, DomainOfInfluenceType } from './models/domain-of-influence.model';

export class DomainOfInfluenceTree extends Tree<DomainOfInfluence> {
  private static domainOfInfluenceTypes: EnumItemDescription<DomainOfInfluenceType>[] = [];

  constructor(data: DomainOfInfluence[], enumUtil: EnumUtil) {
    super(
      (() => {
        // this is necessary, because super() calls buildDisplayName() where enumUtil is not available,
        // because the instance properties are not set yet.
        DomainOfInfluenceTree.domainOfInfluenceTypes = enumUtil.getArrayWithDescriptions<DomainOfInfluenceType>(
          DomainOfInfluenceType,
          'DOMAIN_OF_INFLUENCE.SHORT_TYPES.',
        );
        return data;
      })(),
    );
  }

  public findById(id: string): DomainOfInfluence | undefined {
    return this.findNodeById(id)?.data;
  }

  public findNodeById(id: string): TreeNode<DomainOfInfluence> | undefined {
    for (const node of this.nodes) {
      const found = node.findFirstNode(doi => doi.id === id);
      if (found) {
        return found;
      }
    }

    return undefined;
  }

  public getSelfAndChildrenAsFlatList(node: TreeNode<DomainOfInfluence>): DomainOfInfluence[] {
    let nodes: DomainOfInfluence[] = [node.data];

    for (const childNode of node.filteredChildNodes) {
      nodes = [...nodes, ...this.getSelfAndChildrenAsFlatList(childNode)];
    }

    return nodes;
  }

  protected buildDisplayName(data: DomainOfInfluence): string {
    const typeName = DomainOfInfluenceTree.domainOfInfluenceTypes.find(x => x.value === data.type)?.description;
    return `${data.name} (${typeName})`;
  }

  protected areEqual(left: DomainOfInfluence, right: DomainOfInfluence): boolean {
    return left.id === right.id;
  }

  protected getChildren(node: DomainOfInfluence): DomainOfInfluence[] | undefined {
    return node.childrenList;
  }
}
