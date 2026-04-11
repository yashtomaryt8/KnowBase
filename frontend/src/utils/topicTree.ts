import type { Topic } from '../types'

export type TreeTopic = Omit<Topic, 'children'> & {
  children?: TreeTopic[]
}

type TopicSiblingMatch = {
  siblings: TreeTopic[]
  index: number
  parentId: string | null
}

export function findTopicSiblings(tree: TreeTopic[], topicId: string): TopicSiblingMatch | null {
  return findTopicSiblingsInLevel(tree, topicId, null)
}

export function getSiblingTopics(tree: TreeTopic[], parentId: string | null): TreeTopic[] {
  if (parentId === null) {
    return tree
  }

  return findChildrenByParentId(tree, parentId) ?? []
}

export function reorderSiblingTopics(
  tree: TreeTopic[],
  parentId: string | null,
  orderedIds: string[],
): TreeTopic[] {
  if (parentId === null) {
    return applySiblingOrder(tree, orderedIds)
  }

  return tree.map((node) => {
    if (node.id === parentId) {
      return {
        ...node,
        children: applySiblingOrder(node.children ?? [], orderedIds),
      }
    }

    if (!node.children?.length) {
      return node
    }

    return {
      ...node,
      children: reorderSiblingTopics(node.children, parentId, orderedIds),
    }
  })
}

function findTopicSiblingsInLevel(
  nodes: TreeTopic[],
  topicId: string,
  parentId: string | null,
): TopicSiblingMatch | null {
  const index = nodes.findIndex((node) => node.id === topicId)
  if (index >= 0) {
    return { siblings: nodes, index, parentId }
  }

  for (const node of nodes) {
    if (!node.children?.length) {
      continue
    }

    const match = findTopicSiblingsInLevel(node.children, topicId, node.id)
    if (match) {
      return match
    }
  }

  return null
}

function findChildrenByParentId(nodes: TreeTopic[], parentId: string): TreeTopic[] | null {
  for (const node of nodes) {
    if (node.id === parentId) {
      return node.children ?? []
    }

    if (!node.children?.length) {
      continue
    }

    const match = findChildrenByParentId(node.children, parentId)
    if (match) {
      return match
    }
  }

  return null
}

function applySiblingOrder(nodes: TreeTopic[], orderedIds: string[]): TreeTopic[] {
  if (nodes.length !== orderedIds.length) {
    return nodes
  }

  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const orderedNodes = orderedIds
    .map((id, index) => {
      const node = nodeMap.get(id)

      if (!node) {
        return null
      }

      return {
        ...node,
        sort_order: index,
      }
    })
    .filter((node): node is TreeTopic => node !== null)

  return orderedNodes.length === nodes.length ? orderedNodes : nodes
}
