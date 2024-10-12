export class GroupModel {
  /** @param {string} name @param {Array<string>} urls */
  constructor(name, urls) {
    this.name = name
    this.pinnedTabsUrls = urls
  }
}

export class GroupEntity {
  /** @param {string} id @param {string} name @param {Array<string>} urls */
  constructor(id, name, urls) {
    this.id = id
    this.name = name
    this.pinnedTabsUrls = urls
  }
}

export class GroupRepository {
  constructor(browser) {
    this.browser = browser
  }

  /** @async @returns {Promise<Array<GroupEntity>>>} */
  async findAll() {
    console.info("ℹ️  GroupRepository.findAll() called")
    const { groupIds } = await this.browser.storage.sync.get(["groupIds"])
    console.log("groupIds", groupIds)
    const allGroups = []
    for (const id of groupIds || []) {
      const group = await this.findById(id)
      if (group) allGroups.push(group)
    }
    console.debug(`🐛 returning all groups [ ${JSON.stringify(allGroups)} ]`)
    return allGroups
  }

  /** @async @param {string} id @returns {Promise<GroupEntity | undefined>} */
  async findById(id) {
    console.info(`ℹ️  GroupRepository.findById(${id}) called`)
    const data = await this.browser.storage.sync.get(id)
    const group = data[id]
    console.debug(`🐛 group found [ ${JSON.stringify(group)} ]`)
    return group
  }

  /** @async @param {string} id @returns {Promise<undefined>} */
  async removeById(id) {
    console.info(`ℹ️  GroupRepository.removeById(${id}) called`)
    await this.browser.storage.sync.remove(id)
    const { groupIds } = await this.browser.storage.sync.get(["groupIds"])
    const newGroupIds = groupIds.filter(groupId => groupId !== id)
    await this.browser.storage.sync.set({ groupIds: newGroupIds })
  }

  /** @async @param {Array<GroupEntity>} groups @returns {Promise<undefined>} */
  async overwriteAll(groups) {
    console.info(`ℹ️  GroupRepository.overwriteAll(${groups}) called`)
    await browser.storage.sync.set({ groups: groups })
  }

  /** @async @param {GroupEntity} updatedGroup @returns {Promise<undefined>} */
  async update(updatedGroup) {
    console.info(`ℹ️  GroupRepository.update(${updatedGroup}) called`)
    const id = updatedGroup.id
    await this.browser.storage.sync.set({ [id]: updatedGroup })
  }

  /** @async @param {GroupModel} group @returns {Promise<undefined>} */
  async add(group) {
    console.info(`ℹ️  GroupRepository.add(${JSON.stringify(group)} called`)
    const id = Math.random().toString(16).slice(2)
    const groupEntity = new GroupEntity(id, group.name, group.pinnedTabsUrls)
    console.debug(`🐛 groupEntity to add [ ${JSON.stringify(groupEntity)} ]`)
    let { groupIds } = await this.browser.storage.sync.get(["groupIds"])
    console.info("groupIds", groupIds)
    groupIds = groupIds || []
    groupIds.push(id)
    console.info("groupIds after push", groupIds)

    await this.browser.storage.sync.set({ groupIds: groupIds })
    await this.browser.storage.sync.set({ [id]: groupEntity })
  }

  /** @async @param {string} partialName @returns {Promise<Array<GroupEntity>>} */
  async findAllByPartialName(partialName) {
    console.info(`ℹ️  GroupRepository.findAllByPartialName(${partialName}) called`)
    const groups = await this.findAll()
    return groups.filter((group) => group.name.toLowerCase().includes(partialName.toLowerCase()))
  }

  /** @async @param {string} movingItemGroupId @param {string} targetItemGroupId */
  async moveItemOrder(movingItemGroupId, targetItemGroupId) {
    console.info(`ℹ️  GroupRepository.moveItemOrder(${movingItemGroupId}, ${targetItemGroupId}) called`)
    const { groupIds } = await this.browser.storage.sync.get(["groupIds"])
    const indexOfTargetGroupId = groupIds.map((groupId, index) => {
      if (groupId === targetItemGroupId) return index
    }).filter((id) => id)
    const filteredIds = groupIds.filter(groupId => groupId !== movingItemGroupId)

    const newGroupIds = filteredIds.toSpliced(indexOfTargetGroupId, 0, movingItemGroupId)
    await this.browser.storage.sync.set({ groupIds: newGroupIds })
  }

  /** @async @returns {Promise<undefined>} **/
  async removeUnlinkedGroups() {
    console.info(`ℹ️  GroupRepository.removeUnlinkedGroups() called`)
    const { groupIds } = await this.browser.storage.sync.get(["groupIds"])
    for (const id of groupIds || []) {
      const group = await this.findById(id)
      if (!group) {
        console.info(`⚠️  Falsey value of [ ${group} ] returned for  groupId [ ${id} ]`)
        const { groupIds } = await this.browser.storage.sync.get(["groupIds"])
        const cleanGroupIds = groupIds.filter(groupId => groupId !== id)
        await this.browser.storage.sync.set({ groupIds: cleanGroupIds })
      }
    }
  }
}

