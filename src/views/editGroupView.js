import { GroupEntity } from "../repositories/groupRepository.js"
import { PreferencesModel } from "../repositories/preferencesRepository.js"

export class EditGroupView {
  contructor() { }

  /** @param {GroupEntity>} group @param {PreferencesModel} preferences  */
  open(group, preferences) {
    const mainContent = document.getElementsByClassName("main-wrapper")[0]
    mainContent.inert = true
    document.getElementById("edit-overlay").dataset.groupId = group?.id
    document.getElementById("removeEditWrapperButton").dataset.groupId = group?.id
    document.getElementById("saveEditWrapperButton").dataset.groupId = group?.id

    let autoloadIsEnabled = false
    if (preferences.loadOnStartup === group.id) {
      autoloadIsEnabled = true
    }
    console.debug(`🐛 autoLoad is Enabled [ ${autoloadIsEnabled} ]`)
    console.debug(`🐛 autoLoad value [ ${JSON.stringify(preferences)} ]`)
    document.getElementById("loadOnStartupCheckbox").checked = autoloadIsEnabled

    const editOverlayElement = document.getElementById("edit-overlay")
    editOverlayElement.classList.add("show")

    const editGroupNameElement = document.getElementById("edit-group-name")
    editGroupNameElement.value = group?.name

    const editGroupsUrlsList = document.getElementById("editGroupsUrlsList")
    while (editGroupsUrlsList.firstChild) {
      editGroupsUrlsList.removeChild(editGroupsUrlsList.lastChild)
    }
    group?.pinnedTabsUrls?.forEach((url) => {
      const urlElement = document.createElement("input")
      urlElement.classList.add("edit-url")
      urlElement.value = url

      editGroupsUrlsList.appendChild(urlElement)
    })
  }

  close() {
    const editOverlayElement = document.getElementById("edit-overlay")
    editOverlayElement.classList.remove("show")

    const mainContent = document.getElementsByClassName("main-wrapper")[0]
    mainContent.inert = false
  }

  /** @returns {{group: GroupEntity, isLoadOnStartup: boolean}} **/
  getValues() {
    const groupId = document.getElementById("edit-overlay").dataset.groupId
    const newName = document.getElementById("edit-group-name").value
    const isLoadOnStartup = document.getElementById("loadOnStartupCheckbox").checked
    const newPinnedTabsUrls = []
    document.getElementById("editGroupsUrlsList").childNodes.forEach((child) => newPinnedTabsUrls.push(child.value))

    return {
      group: new GroupEntity(groupId, newName, newPinnedTabsUrls),
      isLoadOnStartup: isLoadOnStartup,
    }
  }
}
