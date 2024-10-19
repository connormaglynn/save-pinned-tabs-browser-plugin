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
    const newPinnedTabsUrls = this.editGroupUrlsListView.getValues()

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
    const faviconImageElement = document.createElement("img")
    faviconImageElement.dataset.index = index
    faviconImageElement.classList.add("favicon")
    faviconImageElement.draggable = false
    try {
      const domain = new URL(url).host
      faviconImageElement.src = `https://icons.duckduckgo.com/ip3/${domain}.ico`
    } catch (e) {
      faviconImageElement.src = "../assets/icons/favicon-16x16.png"
    }

    const urlElement = document.createElement("input")
    urlElement.dataset.index = index
    urlElement.classList.add("edit-url")
    urlElement.value = url

    const urlWrapperElement = document.createElement("div")
    urlWrapperElement.dataset.index = index
    urlWrapperElement.classList.add("edit-url-wrapper")
    urlWrapperElement.draggable = true
    urlWrapperElement.addEventListener("dragstart", this.dragStartHandler)
    urlWrapperElement.ondrop = this.dropHandler
    urlWrapperElement.ondragover = this.dragoverHandler

    urlWrapperElement.appendChild(faviconImageElement)
    urlWrapperElement.appendChild(urlElement)

    editGroupsUrlsListElement.appendChild(urlWrapperElement)
  }

  /** @returns {Array<string>} **/
  getValues() {
    const newPinnedTabsUrls = []
    document.getElementById(this.id).childNodes.forEach((child) => newPinnedTabsUrls.push(child.querySelector("input").value))
    return newPinnedTabsUrls
  }

  dragStartHandler = (event) => {
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
    const filteredUrls = urls.filter((_, index) => Number(movingItemIndex) !== Number(index))
    const newUrlOrder = filteredUrls.toSpliced(targetItemIndex, 0, movingItemUrl)
    this.replace(newUrlOrder)
  }
}
