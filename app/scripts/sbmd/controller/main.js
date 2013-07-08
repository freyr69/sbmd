app.controller("MainController", function ($scope, $timeout) {
    'use strict';

    $scope.title = "SBMD";

    $scope.remainingSetupTime = -1;
    $scope.remainingSessionTime = -1;
    $scope.setupRunning = false;
    $scope.sessionRunning = false;


    // main settings
    $scope.minutesUntilStart = 1;
    $scope.minutesUntilRelease = 1;
    $scope.beepDuringCountdown = true;
    $scope.showRemainingSessionTime = true;
    $scope.releaseApiUrl = "http://localhost/sbmd/release/";

    $scope.randomTimePlay = false;
    $scope.minRandomTime = 20;
    $scope.maxRandomTime = 240;

    // movement
    $scope.movementSensivity = 10;
    $scope.minutesToAddWhenMove = 1;
    $scope.movementsBeforeAddedTime = 1;
    $scope.movementTeasingApiUrl = "http://localhost/sbmd/tease/movement/";

    // sound teasing
    $scope.useSoundTeasing = true;
    $scope.soundSensitivity = 50;
    $scope.minutesToAddWhenNoise = 1;
    $scope.soundTeasingApiUrl = "http://localhost/sbmd/tease/sound/";

    // random teasing
    $scope.useRandomTease = true;
    $scope.teaseProbability = 10;
    $scope.randomTeasingApiUrl = "http://localhost/sbmd/tease/random/";

    $scope.triggerRelease = function () {
        console.log("triggering release...");
    };

    $scope.handleMovement = function() {
        //$scope.triggerMovementTease();
        console.log("got movement...");
    }

    $scope.triggerMovementTease = function () {
        console.log("triggering movement tease");
    };

    $scope.triggerSoundTease = function () {
        console.log("triggering sound tease");
    };

    $scope.triggerRandomTease = function () {
        console.log("triggering random tease");
    };

    /**
     * reset session time
     * count down through "pre-session" time
     * start session
     *
     */
    $scope.startSession = function () {
        console.log("Starting session");
        $scope.remainingSetupTime = $scope.minutesUntilStart * 60;
        $scope.remainingSessionTime = $scope.minutesUntilRelease * 60

        //$scope.sessionRunning = true;
        //runSessionCountdown();
        $scope.setupRunning = true;
        runSetupCountdown();
    };

    $scope.stopSession = function () {
        console.log("Stopping session");
        $scope.setupRunning = false;
        $scope.sessionRunning = false;
    };

    $scope.toggleSession = function () {
        if ($scope.sessionRunning || $scope.setupRunning) {
            $scope.stopSession();
        } else {
            $scope.startSession();
        }
    }

    $scope.addTimeToSession = function (minutes) {
        if ($scope.remainingSessionTime > 0) {
            $scope.remainingSessionTime += (minutes * 60);
        }
    }

    $scope.getSessionButtonText = function () {
        if ($scope.sessionRunning || $scope.setupRunning) {
            return "Stop Session";
        } else {
            return "Start Session";
        }
    };

    var runSetupCountdown = function () {

        if (!$scope.setupRunning) {
            return;
        }

        if ($scope.sessionRunning) {
            return;
        }

        $scope.remainingSetupTime -= 1;

        if ($scope.remainingSetupTime < 10 && $scope.remainingSetupTime > 0 && $scope.beepDuringCountdown) {
            $scope.playBeep();
        }

        if ($scope.remainingSetupTime > 0) {
            $timeout(runSetupCountdown, 1000);
        } else {
            $scope.setupRunning = false;
            $scope.sessionRunning = true;
            runSessionCountdown();
        }
    }

    var runSessionCountdown = function () {
        if (!$scope.sessionRunning) {
            return;
        }

        $scope.remainingSessionTime -= 1;

        if ($scope.remainingSessionTime > 0) {
            $timeout(runSessionCountdown, 1000);
        } else {
            $scope.triggerRelease();
            $scope.sessionRunning = false;
            $scope.setupRunning = false;
        }
    };

    $scope.formatRemainingTime = function (secs) {

        if (!$scope.showRemainingSessionTime && !$scope.setupRunning) {
            return "Session Running...";
        }

        if (secs < 0) {
            secs = 0;
        }

        var hours = Math.floor(secs / (60 * 60));
        var divisorForMinutes = secs % (60 * 60);
        var minutes = Math.floor(divisorForMinutes / 60);
        var divisorForSeconds = divisorForMinutes % 60;
        var seconds = Math.ceil(divisorForSeconds);

        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }

        var time = hours + ":" + minutes + ":" + seconds;
        return time;
    };

    $scope.playBeep = function () {
        var beep = document.getElementById('beep');
        if (beep) beep.Play();
    }


    // Webcam stuff

    var _video;

    $scope.webcamError = false;
    $scope.onError = function (err) {
        $scope.$apply(
            function () {
                $scope.webcamError = err;
            }
        );
    };

    $scope.onSuccess = function (videoElem) {
        _video = videoElem;
        console.log("we're streaming!!!");
    };

    $scope.onStream = function (stream, videoElem) {
        // do something with stream?
        //console.log(stream);
    }

    var lastMovementEventDate = null;

    $scope.onMovement = function() {
        // let's be nice and have a max of one event per second...
        var now = +new Date();
        if (lastMovementEventDate && now < lastMovementEventDate + 1000) {
            //nothing to do here...
        } else {
            lastMovementEventDate = now;
            //$scope.takeSnapshot();
            $scope.handleMovement();
        }
    }
    /*
    $scope.takeSnapshot = function() {
        if (_video) {

            var hiddenCanvas = document.createElement('canvas');
            hiddenCanvas.width = _video.width;
            hiddenCanvas.height = _video.height;
            var ctx = hiddenCanvas.getContext('2d');
            ctx.drawImage(_video, 0, 0, _video.width, _video.height);

            var imgData = hiddenCanvas.toDataURL("img/png");
            imgData = imgData.replace('data:image/png:base64', '');

            var postData = JSON.stringify({imgData: imgData});

            //console.log(postData);

            $.ajax({
                url: 'http://localhost/sbmd/snapshot.php',
                type: 'POST',
                data: {name: 'test', data: postData},
                contentType: 'application/json'
            });

        }
    }
    */


});