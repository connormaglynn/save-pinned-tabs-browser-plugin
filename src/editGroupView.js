class EditGroupView {
  contructor() { }

  /** @param {GroupEntity>} group */
  open(group) {
    const mainContent = document.getElementsByClassName("main-wrapper")[0]
    mainContent.inert = true
    document.getElementById("removeEditWrapperButton").dataset.groupId = group?.id
    document.getElementById("saveEditWrapperButton").dataset.groupId = group?.id

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

  /** @returns {GroupModel} **/
  getValues() {
    const newName = document.getElementById("edit-group-name").value
    const newPinnedTabsUrls = []
    document.getElementById("editGroupsUrlsList").childNodes.forEach((child) => newPinnedTabsUrls.push(child.value))

    return new GroupModel(newName, newPinnedTabsUrls)
  }
}
