import { GroupModel, GroupEntity } from "../repositories/groupRepository.js"

export class ClickEventHandler {
  /** @param {groupRepository} groupRepository @param {GroupView} groupView @param {EditGroupView} editGroupView @param {object} browser @param {object} clickEvents **/
  constructor(groupRepository, groupsView, editGroupView, browser, clickEvents) {
    this.groupRepository = groupRepository
    this.groupsView = groupsView
    this.editGroupView = editGroupView
    this.browser = browser
    this.clickEvents = clickEvents
  }
  handle = async (event) => {
    const target = event.target
    const clickEvent = target.dataset.clickEvent

    if (this.clickEvents.OPEN_GROUP_TABS_BY_GROUP_ID_ON_ELEMENT === clickEvent) {
      const groupId = target.dataset.groupId
      const oldPinnedTabs = await this.browser.tabs.query({ pinned: true, currentWindow: true })
      const oldPinnedTabsIds = oldPinnedTabs.map((tab) => tab.id)

      const newGroup = await this.groupRepository.findById(groupId)
      const newPinnedTabsUrls = newGroup?.pinnedTabsUrls
      newPinnedTabsUrls?.forEach(async (url) => {
        await this.browser.tabs.create({
          url: url,
          pinned: true,
        })
      })

      await this.browser.tabs.remove(oldPinnedTabsIds)
    }

    if (this.clickEvents.REMOVE_GROUP_BY_GROUP_ID_ON_ELEMENT === clickEvent) {
      const groupIdToRemove = target.dataset.groupId
      await this.groupRepository.removeById(groupIdToRemove)
      await this.groupsView.refresh(await this.groupRepository.findAll())
      this.editGroupView.close()
    }

    if (this.clickEvents.SAVE_GROUP_EDITS_BY_GROUP_ID_ON_ELEMENT === clickEvent) {
      const groupIdToEdit = target.dataset.groupId
      const edittedGroup = this.editGroupView.getValues()

      await this.groupRepository.update(new GroupEntity(groupIdToEdit, edittedGroup.name, edittedGroup.pinnedTabsUrls))
      await this.groupsView.refresh(await this.groupRepository.findAll())
      this.editGroupView.close()
    }

    if (this.clickEvents.CREATE_NEW_GROUP_FROM_CURRENT_PINNED_TABS === clickEvent) {
      const groupName = document.getElementById("groupName").value
      const pinnedTabs = await this.browser.tabs.query({ pinned: true, currentWindow: true })
      const pinnedTabsUrls = pinnedTabs.map((tab) => tab.url)

      await this.groupRepository.add(new GroupModel(groupName, pinnedTabsUrls))
      await this.groupsView.refresh(await this.groupRepository.findAll())
    }

    if (this.clickEvents.OPEN_EDIT_VIEW_BY_GROUP_ID_ON_ELEMENT === clickEvent) {
      const group = await this.groupRepository.findById(target.dataset.groupId)
      this.editGroupView.open(group)
    }

    if (this.clickEvents.CLOSE_EDIT_VIEW === clickEvent) {
      this.editGroupView.close()
    }
  }
}
