﻿// 모눈 템플릿에 대한 소개는 다음 문서를 참조하십시오.
// http://go.microsoft.com/fwlink/?LinkID=232446
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;
    var hasSettingPane = false;
    var appmodel = Windows.ApplicationModel;
    var storage = Windows.Storage;

    function onPrivacyCommand(e) {
        // Privacy Policy page URL
        var uri = Windows.Foundation.Uri("http://uxfactory.tistory.com/97");
        Windows.System.Launcher.launchUriAsync(uri).then(
            function (success) {
                if (success) {

                } else {

                }
            }
        );
    }
    function onOptionsCommand(e) {
        WinJS.Navigation.navigate("/pages/options/options.html", {});
    }
    function onCommandsRequested(e) {
        var optionsCommand = new Windows.UI.ApplicationSettings.SettingsCommand("option", "Options", onOptionsCommand);
        e.request.applicationCommands.append(optionsCommand);

        var privacyCommand = new Windows.UI.ApplicationSettings.SettingsCommand("privacy", "Privacy Policy", onPrivacyCommand);
        e.request.applicationCommands.append(privacyCommand);
    }
    function navigateToPath(folderPath, fileName) { // filename은 특정 이미지를 바로 보여주기 원할 경우
        var parentFolder = folderPath.substring(0, folderPath.indexOf("\\") + 1);
        if (parentFolder === "") parentFolder = folderPath;

        if (Data.checkAccess(folderPath)) {
            // 파일을 하나만 선택했을 시 진입점
            Windows.Storage.StorageFolder.getFolderFromPathAsync(folderPath).done(function (f) {
                if (f && Windows.Storage.AccessCache.StorageApplicationPermissions.futureAccessList.checkAccess(f)) {
                    return nav.navigate(Application.navigator.home, { folder: f, item: ["files", fileName], resetPath: true });
                }
            });
        } else {
            nav.navigate("/pages/options/options.html", { folderPath: folderPath, fileName: fileName, parentFolder: parentFolder });
        }
    }
    WinJS.Namespace.define("SelectView", {
        navigateToPath: navigateToPath,
    });
    app.addEventListener("activated", function (args) {
        // Setting Pane
        if (!hasSettingPane) {
            var settingsPane = Windows.UI.ApplicationSettings.SettingsPane.getForCurrentView();
            settingsPane.addEventListener("commandsrequested", onCommandsRequested);
            hasSettingPane = true;
        }

        appmodel.Package.current.installedLocation.getFileAsync("data\\WindowsStoreProxy.xml").done(
            function (file) {
                appmodel.Store.CurrentAppSimulator.reloadSimulatorAsync(file);
            }
        );

        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: 이 응용 프로그램은 새로 시작되었습니다. 여기서
                // 응용 프로그램을 초기화하십시오.
            } else {
                // TODO: 이 응용 프로그램은 일시 중단되었다가 다시 활성화되었습니다.
                // 여기서 응용 프로그램 상태를 복원하십시오.
            }
            //if (app.sessionState.history) {
            //    nav.history = app.sessionState.history;
            //}
            args.setPromise(WinJS.UI.processAll().then(function () {
                if (nav.location) {
                    nav.history.current.initialPlaceholder = true;
                    return nav.navigate(nav.location, nav.state);
                } else {
                    // 앱 실행 시 진입점
                    // TODO: 중단에서 활성화 될 때 테스트 및 처리
                    return nav.navigate(Application.navigator.home, { resetPath: true });
                }
            }));
        } else if (args.detail.kind == activation.ActivationKind.file) {
            if (args.detail.files.size > 0) {
                args.setPromise(WinJS.UI.processAll().then(function () {
                    nav.history = {};

                    if (args.detail.files.length === 1) {
                        var folderPath = args.detail.files[0].path.substring(0, args.detail.files[0].path.lastIndexOf("\\"));

                        var path = Data.addRootSlash(folderPath);
                        navigateToPath(path, args.detail.files[0].name);
                    } else return nav.navigate(Application.navigator.home, { files: args.detail.files, resetPath: true }); // 파일을 여러개 선택했을 시의 진입점
                }));
            }
        }

    });

    app.oncheckpoint = function (args) {
        // TODO: 이 응용 프로그램은 곧 일시 중단됩니다. 여러 일시 중단에서
        // 유지해야 하는 상태를 저장하십시오. 
        //  응용 프로그램이 일시 중단되기 전에 비동기 작업을 완료해야 하는 경우 
        // args.setPromise()를 호출하십시오.
        app.sessionState.history = nav.history;
    };

    app.start();
})();
