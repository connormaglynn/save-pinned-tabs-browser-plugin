export class GroupModel {
  /** @param {string} name @param {Array<string>} urls **/
  constructor(name, urls) {
    this.name = name
    this.pinnedTabsUrls = urls
  }
}

export class GroupEntity {
  /** @param {string} id @param {string} name @param {Array<string>} urls **/
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

  /** @async @returns {Promise<Array<GroupEntity>>>} **/
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

  /** @async @param {string} id @returns {Promise<GroupEntity | undefined>} **/
  async findById(id) {
    console.info(`ℹ️  GroupRepository.findById(${id}) called`)
    const data = await this.browser.storage.sync.get(id)
    const group = data[id]
    console.debug(`🐛 group found [ ${JSON.stringify(group)} ]`)
    return group
  }

  /** @async @param {string} id @returns {Promise<undefined>} **/
  async removeById(id) {
    console.info(`ℹ️  GroupRepository.removeById(${id}) called`)
    await this.browser.storage.sync.remove(id)
    const { groupIds } = await this.browser.storage.sync.get(["groupIds"])
    const newGroupIds = groupIds.filter(groupId => groupId !== id)
    await this.browser.storage.sync.set({ groupIds: newGroupIds })
  }

  /** @async @param {GroupEntity} updatedGroup @returns {Promise<undefined>} **/
  async update(updatedGroup) {
    console.info(`ℹ️  GroupRepository.update(${updatedGroup}) called`)
    const id = updatedGroup.id
    await this.browser.storage.sync.set({ [id]: updatedGroup })
  }

  /** @async @param {GroupModel} group @returns {Promise<undefined>} **/
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

  /** @async @returns {Promise<Array<string>>} **/
  async getGroupIds() {
    const { groupIds } = await this.browser.storage.sync.get(["groupIds"]);
    return groupIds || [];
  }

  /** @async @returns {Promise<boolean>} **/
  async groupExists(id) {
    return Boolean(await this.findById(id))
  }

  /** @async @returns {Promise<Array<string>>} **/
  async updateGroupIds(groupIds) {
    await this.browser.storage.sync.set({ groupIds });
  }

  /** @async @param {string} partialName @returns {Promise<Array<GroupEntity>>} **/
  async findAllByPartialName(partialName) {
    console.info(`ℹ️  GroupRepository.findAllByPartialName(${partialName}) called`)
    const groups = await this.findAll()
    return groups.filter((group) => group.name.toLowerCase().includes(partialName.toLowerCase()))
  }
}
