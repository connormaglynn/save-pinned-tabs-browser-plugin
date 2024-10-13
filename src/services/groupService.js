import { GroupEntity, GroupRepository } from "../repositories/groupRepository.js"

export class GroupService {
  /** @param {GroupRepository} groupRepository  **/
  constructor(groupRepository) {
    this.groupRepository = groupRepository
  }

  /** @async @param {string} movingItemGroupId @param {string} targetItemGroupId **/
  async moveItemOrder(movingItemGroupId, targetItemGroupId) {
    console.info(`ℹ️  GroupService.moveItemOrder(${movingItemGroupId}, ${targetItemGroupId}) called`)
    const groupIds = await this.groupRepository.getGroupIds()
    const indexOfTargetGroupId = groupIds.map((groupId, index) => {
      if (groupId === targetItemGroupId) return index
    }).filter((id) => id)
    const filteredIds = groupIds.filter(groupId => groupId !== movingItemGroupId)

    const newGroupIds = filteredIds.toSpliced(indexOfTargetGroupId, 0, movingItemGroupId)
    await this.groupRepository.updateGroupIds(newGroupIds)
  }

  /** @async @returns {Promise<undefined>} **/
  async removeUnlinkedGroups() {
    console.info(`ℹ️  GroupService.removeUnlinkedGroups() called`)
    const groupIds = await this.groupRepository.getGroupIds()
    const linkedGroupIds = [];
    for (const id of groupIds) {
      const exists = await this.groupRepository.groupExists(id)
      if (exists) {
        linkedGroupIds.push(id)
      } else {
        console.info(`⚠️  Falsey value for groupId [ ${id} ]`)
      }
    }

    await this.groupRepository.updateGroupIds(linkedGroupIds);
  }

  /** @async @returns {Promise<Array<GroupEntity>>>} **/
  async findAll() {
    return await this.groupRepository.findAll()
  }

  /** @async @param {string} id @returns {Promise<GroupEntity | undefined>} **/
  async findById(id) {
    return await this.groupRepository.findById(id)
  }

  /** @async @param {GroupEntity} updatedGroup @returns {Promise<undefined>} **/
  async update(updatedGroup) {
    return await this.groupRepository.update(updatedGroup)
  }

  /** @async @param {GroupModel} group @returns {Promise<undefined>} **/
  async add(group) {
    return await this.groupRepository.add(group)
  }

  /** @async @param {string} partialName @returns {Promise<Array<GroupEntity>>} **/
  async findAllByPartialName(partialName) {
    return await this.groupRepository.findAllByPartialName(partialName)
  }

  /** @async @param {string} id @returns {Promise<undefined>} **/
  async removeById(id) {
    return await this.groupRepository.removeById(id)
  }
}

