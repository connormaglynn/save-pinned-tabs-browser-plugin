console.log("hit 5")
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("hit 6")
  if (message.action === "savePinnedTabs") {
    console.log("hit 7")
    savePinnedTabs()
    sendResponse({ message: "Pinned tabs saved" })
  }
})

function savePinnedTabs() {
  chrome.tabs.query({ pinned: true }, function (pinnedTabs) {
    var pinnedTabURLs = pinnedTabs.map((tab) => tab.url)
    chrome.storage.sync.set({ pinnedTabs: pinnedTabURLs }, function () {
      console.log("Pinned tabs saved successfully")
    })
  })
}
