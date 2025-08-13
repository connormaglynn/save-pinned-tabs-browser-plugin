import { GroupModel, GroupEntity } from "../repositories/groupRepository.js"
import { PreferencesModel } from "../repositories/preferencesRepository.js"
import { GroupService } from "../services/groupService.js"
import { EditGroupView } from "../views/editGroupView.js"
import { PreferencesService } from "../services/preferencesService.js"
import { TabsService } from "../services/tabsService.js"

export class ClickEventHandler {
  /** 
   * @param {GroupService} groupService
   * @param {PreferencesService} preferencesService
   * @param {TabsService} tabsService
   * @param {GroupView} groupView 
   * @param {EditGroupView} editGroupView 
   * @param {object} clickEvents 
   */
  constructor(groupService, preferencesService, tabsService, groupsView, editGroupView, clickEvents) {
    this.groupService = groupService
    this.preferencesService = preferencesService
    this.tabsService = tabsService
    this.groupsView = groupsView
    this.editGroupView = editGroupView
    this.clickEvents = clickEvents
  }
  handle = async (event) => {
    const target = event.target
    const clickEvent = target.dataset.clickEvent

    if (this.clickEvents.OPEN_GROUP_TABS_BY_GROUP_ID_ON_ELEMENT === clickEvent) {
      const groupId = target.dataset.groupId
      const newGroup = await this.groupService.findById(groupId)
      await this.tabsService.replacePinnedTabsOnCurrentWindow(newGroup)
    }

    if (this.clickEvents.REMOVE_GROUP_BY_GROUP_ID_ON_ELEMENT === clickEvent) {
      const groupIdToRemove = target.dataset.groupId
      await this.groupService.removeById(groupIdToRemove)
      await this.groupsView.refresh(await this.groupService.findAll())
      this.editGroupView.close()
    }

    if (this.clickEvents.SAVE_GROUP_EDITS_BY_GROUP_ID_ON_ELEMENT === clickEvent) {
      const { group, isLoadOnStartup } = this.editGroupView.getValues()
      const preferences = await this.preferencesService.get()

      if (isLoadOnStartup) {
        await this.preferencesService.update(new PreferencesModel(group.id))
      }
      if (!isLoadOnStartup && preferences.groupIdToLoadOnStartup === group.id) {
        await this.preferencesService.update(new PreferencesModel(null))
      }
      await this.groupService.update(group)
      await this.groupsView.refresh(await this.groupService.findAll())
      this.editGroupView.close()
    }

    if (this.clickEvents.CREATE_NEW_GROUP_FROM_CURRENT_PINNED_TABS === clickEvent) {
      const groupName = document.getElementById("groupName").value
      const pinnedTabs = await this.tabsService.getPinnedTabsOnCurrentWindow()
      const pinnedTabsUrls = pinnedTabs.map((tab) => tab.url)

      await this.groupService.add(new GroupModel(groupName, pinnedTabsUrls))
      await this.groupsView.refresh(await this.groupService.findAll())
    }

    if (this.clickEvents.OPEN_EDIT_VIEW_BY_GROUP_ID_ON_ELEMENT === clickEvent) {
      const group = await this.groupService.findById(target.dataset.groupId)
      const preferences = await this.preferencesService.get()
      await this.editGroupView.open(group, preferences)
    }

    if (this.clickEvents.CLOSE_EDIT_VIEW === clickEvent) {
      this.editGroupView.close()
    }

    if (this.clickEvents.ADD_URL_TO_GROUP === clickEvent) {
      const { group, isLoadOnStartup } = this.editGroupView.getValues()
      group.pinnedTabsUrls.push('')
      const groupWithAddedUrl = new GroupEntity(group.id, group.name, group.pinnedTabsUrls)
      await this.editGroupView.open(groupWithAddedUrl, new PreferencesModel(isLoadOnStartup))
    }

    if (this.clickEvents.REMOVE_URL_FROM_GROUP_BY_INDEX === clickEvent) {
      const index = target.dataset.index
      const { group, isLoadOnStartup } = this.editGroupView.getValues()
      group.pinnedTabsUrls.splice(index, 1)
      const groupWithRemovedUrl = new GroupEntity(group.id, group.name, group.pinnedTabsUrls)
      await this.editGroupView.open(groupWithRemovedUrl, new PreferencesModel(isLoadOnStartup))
    }
  }
}
