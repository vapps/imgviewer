﻿(function () {
    "use strict";

    var list = new WinJS.Binding.List();
    var groupedItems = list.createGrouped(
        function groupKeySelector(item) { return item.group.key; },
        function groupDataSelector(item) { return item.group; }
    );

    // TODO: 데이터를 실제 데이터로 바꿉니다.
    // 사용할 수 있는 경우 언제든지 비동기 소스로부터 데이터를 추가할 수 있습니다.
    var installDirectory = Windows.ApplicationModel.Package.current.installedLocation;
    var count = 0;
    installDirectory.getFolderAsync("data").done(function (dataFolder) {
        dataFolder.getFoldersAsync().done(function (folders) {
            folders.forEach(function (folder) {
                folder.getThumbnailAsync(Windows.Storage.FileProperties.ThumbnailMode.picturesView).done(function (folderThumbnail) {
                    folder.getFilesAsync().done(function (files) {
                        files.forEach(function (file) {
                            file.getThumbnailAsync(Windows.Storage.FileProperties.ThumbnailMode.picturesView).done(function (thumbnail) {
                                var item = {
                                    group: {
                                        key: folder.name,
                                        title: folder.name,
                                        thumbnail: URL.createObjectURL(folderThumbnail)
                                    },
                                    title: file.name,
                                    image: URL.createObjectURL(file),
                                    file: file,
                                    thumbnail: URL.createObjectURL(thumbnail)
                                }
                                list.push(item);
                            });
                        });
                    });
                });
            }); // end of folders.forEach
        });// end of dataFolders.forEach


    });
    WinJS.Namespace.define("Data", {
        items: groupedItems,
        groups: groupedItems.groups,
        getItemReference: getItemReference,
        getItemsFromGroup: getItemsFromGroup,
        resolveGroupReference: resolveGroupReference,
        resolveItemReference: resolveItemReference
    });

    // 그룹 키와 항목 제목을 손쉽게 serialize할 수 있는 고유 참조로 사용하여
    // 항목에 대한 참조를 가져옵니다.
    function getItemReference(item) {
        return [item.group.key, item.title];
    }

    // 이 함수는 제공된 그룹에 속한 항목만 포함된
    // WinJS.Binding.List를 반환합니다.
    function getItemsFromGroup(group) {
        return list.createFiltered(function (item) { return item.group.key === group.key; });
    }

    // 제공된 그룹 키에 해당되는 고유 그룹을 가져옵니다.
    function resolveGroupReference(key) {
        for (var i = 0; i < groupedItems.groups.length; i++) {
            if (groupedItems.groups.getAt(i).key === key) {
                return groupedItems.groups.getAt(i);
            }
        }
    }

    // 그룹 키 및 항목 제목을 포함하는 제공된 문자열 배열에서 고유한 항목을
    // 가져옵니다.
    function resolveItemReference(reference) {
        for (var i = 0; i < groupedItems.length; i++) {
            var item = groupedItems.getAt(i);
            if (item.group.key === reference[0] && item.title === reference[1]) {
                return item;
            }
        }
    }

})();
