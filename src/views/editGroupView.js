import { GroupEntity } from "../repositories/groupRepository.js"
import { PreferencesModel } from "../repositories/preferencesRepository.js"

export class EditGroupView {
  constructor() {
    this.editGroupUrlsListView = new EditGroupUrlsListView()
  }

  /** @param {GroupEntity>} group @param {PreferencesModel} preferences  */
  open(group, preferences) {
    const mainContent = document.getElementsByClassName("main-wrapper")[0]
    mainContent.inert = true
    document.getElementById("edit-overlay").dataset.groupId = group?.id
    document.getElementById("removeEditWrapperButton").dataset.groupId = group?.id
    document.getElementById("saveEditWrapperButton").dataset.groupId = group?.id

    let autoloadIsEnabled = false
    if (preferences.groupIdToLoadOnStartup === group.id) {
      autoloadIsEnabled = true
    }
    document.getElementById("loadOnStartupCheckbox").checked = autoloadIsEnabled

    const editOverlayElement = document.getElementById("edit-overlay")
    editOverlayElement.classList.add("show")

    const editGroupNameElement = document.getElementById("edit-group-name")
    editGroupNameElement.value = group?.name

    this.editGroupUrlsListView.replace(group.pinnedTabsUrls)
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

export class EditGroupUrlsListView {
  constructor() {
    this.id = "editGroupsUrlsList"
  }

  /** @param {Array<string>} urls  */
  replace(urls) {
    this.close()
    this.open(urls)
  }

  /** @param {Array<string>} urls  */
  open(urls) {
    const editGroupsUrlsList = document.getElementById(this.id)
    urls.forEach((url, index) => {
      this.appendUrlInputTextBox(editGroupsUrlsList, url, index)
    })
  }

  close() {
    const editGroupsUrlsList = document.getElementById(this.id)
    while (editGroupsUrlsList.firstChild) {
      editGroupsUrlsList.removeChild(editGroupsUrlsList.lastChild)
    }
  }

  /** @param {HTMLElement} editGroupsUrlsListElement @param {string} url  @param {number} index **/
  appendUrlInputTextBox(editGroupsUrlsListElement, url, index) {
    const urlElement = document.createElement("input")
    urlElement.classList.add("edit-url")
    urlElement.value = url
    urlElement.dataset.index = index
    urlElement.draggable = true
    urlElement.addEventListener("dragstart", this.dragStartHandler)
    urlElement.ondrop = this.dropHandler
    urlElement.ondragover = this.dragoverHandler

    editGroupsUrlsListElement.appendChild(urlElement)
  }

  /** @returns {Array<string>} **/
  getValues() {
    const newPinnedTabsUrls = []
    document.getElementById(this.id).childNodes.forEach((child) => newPinnedTabsUrls.push(child.value))
    return newPinnedTabsUrls
  }

  dragStartHandler = (event) => {
    console.debug(`🐛 dragStartHandler() - index ${event.target.dataset.index}`)
    event.dataTransfer.setData('text', event.target.dataset.index);
    event.dataTransfer.dropEffect = "move"
  }

  dragoverHandler = (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }

  dropHandler = async (event) => {
    event.preventDefault()
    const movingItemIndex = event.dataTransfer.getData("text")
    const targetItemIndex = event.target.dataset.index
    const urls = this.getValues()
    const movingItemUrl = urls[movingItemIndex]
    const filteredUrls = urls.filter((_, index) => Number(movingItemIndex) !== index)
    const newUrlOrder = filteredUrls.toSpliced(targetItemIndex, 0, movingItemUrl)
    this.replace(newUrlOrder)
  }
}
