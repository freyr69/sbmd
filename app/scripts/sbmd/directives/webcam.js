'use strict';

(function () {
    // GetUserMedia is not yet supported by all browsers
    // Until then, we need to handle the vendor prefixes
    navigator.getMedia = ( navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);

    // Checks if getUserMedia is available on the client browser
    window.hasUserMedia = function hasUserMedia() {
        return navigator.getMedia ? true : false;
    };
})();

angular.module('webcam', [])
    .directive('webcam', function () {
        return {
            template: '<div class="webcam" ng-transclude>' +
                '<video id="webcam" autoplay width="640" height="480"></video>' +
                '<div class="overlay"><canvas id="canvas-source" width="640" height="480"></canvas>' +
                '<canvas id="canvas-blended" width="640" height="480"></canvas></div>' +
                '</div>',
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                onError: '&',
                onStream: '&',
                onStreaming: '&',
                onMovement: '&',
                placeholder: '=',
                width: '=',
                height: '='
            },
            link: function postLink($scope, element) {
                // called when camera stream is loaded
                var onSuccess = function onSuccess(stream) {
                    // Firefox supports a src object
                    if (navigator.mozGetUserMedia) {
                        video.mozSrcObject = stream;
                    } else {
                        var vendorURL = window.URL || window.webkitURL;
                        video.src = vendorURL.createObjectURL(stream);
                    }

                    /* Start playing the video to show the stream from the webcam*/
                    //video.play();

                    /* Call custom callback */
                    if ($scope.onStream) {
                        $scope.onStream({stream: stream, video: video});
                    }
                };

                // called when any error happens
                var onFailure = function onFailure(err) {
                    removeLoader();
                    if (console && console.log) {
                        console.log('The following error occured: ', err);
                    }

                    /* Call custom callback */
                    if ($scope.onError) {
                        $scope.onError({err: err});
                    }
                };

                if ($scope.placeholder) {
                    var placeholder = document.createElement('img');
                    placeholder.class = 'webcam-loader';
                    placeholder.src = $scope.placeholder;
                    element.append(placeholder);
                }

                var removeLoader = function removeLoader() {
                    if (placeholder) {
                        placeholder.remove();
                    }
                };

                // Default variables
                var isStreaming = false;
                //width = element.width = 640,
                //width = element.width = $scope.width,
                //height = element.height = $scope.height;
                //height = element.height = 0;

                // Check the availability of getUserMedia across supported browsers
                if (!window.hasUserMedia()) {
                    onFailure({code: -1, msg: 'Browser does not support getUserMedia.'});
                    return;
                }

                var video = element.find('video')[0];
                var canvasSource = $("#canvas-source")[0];
                var canvasBlended = $("#canvas-blended")[0];
                var contextSource = canvasSource.getContext('2d');
                var contextBlended = canvasBlended.getContext('2d');

                var timeOut, lastImageData;

                // invert the x-axis so that it looks like a mirror...
                contextSource.translate(canvasSource.width, 0);
                contextSource.scale(-1, 1);

                var update = function() {
                    drawVideo();
                    blend();
                    checkArea();
                    timeOut = setTimeout(update, 1000/60);
                };


                var drawVideo = function() {
                    contextSource.drawImage(video, 0, 0, video.width, video.height);
                };

                /**
                 * equivalent to Math.abs() but much faster...
                 * @param value
                 * @returns {number}
                 */
                var fastAbs = function (value) {

                    return (value ^ (value >> 31)) - (value >> 31);
                };

                /**
                 * change value to black and white at limit 0x15...
                 * @param value
                 * @returns {number}
                 */
                var threshold = function (value) {
                    return (value > 0x15) ? 0xFF : 0;
                };

                /*
                var difference = function (target, data1, data2) {
                    // blend mode difference
                    if (data1.length != data2.length) return null;
                    var i = 0;
                    while (i < (data1.length * 0.25)) {
                        target[4 * i] = data1[4 * i] == 0 ? 0 : fastAbs(data1[4 * i] - data2[4 * i]);
                        target[4 * i + 1] = data1[4 * i + 1] == 0 ? 0 : fastAbs(data1[4 * i + 1] - data2[4 * i + 1]);
                        target[4 * i + 2] = data1[4 * i + 2] == 0 ? 0 : fastAbs(data1[4 * i + 2] - data2[4 * i + 2]);
                        target[4 * i + 3] = 0xFF;
                        ++i;
                    }
                };
                */

                var differenceAccuracy = function (target, data1, data2) {
                    if (data1.length != data2.length) {
                        return;
                    }
                    var i = 0;
                    while (i < (data1.length * 0.25)) {
                        var average1 = (data1[4 * i] + data1[4 * i + 1] + data1[4 * i + 2]) / 3;
                        var average2 = (data2[4 * i] + data2[4 * i + 1] + data2[4 * i + 2]) / 3;
                        var diff = threshold(fastAbs(average1 - average2));
                        target[4 * i] = diff;
                        target[4 * i + 1] = diff;
                        target[4 * i + 2] = diff;
                        target[4 * i + 3] = 0xFF;
                        ++i;
                    }
                };

                var blend = function() {
                    var width = canvasSource.width;
                    var height = canvasSource.height;

                    // get webcam image data
                    var sourceData = contextSource.getImageData(0,0,width,height);
                    // create an image if the previous image doesn't exist
                    if (!lastImageData) lastImageData = contextSource.getImageData(0,0,width,height);
                    // create an ImageData instance to receive the blended result
                    var blendedData = contextSource.createImageData(width, height);
                    //blend the 2 images
                    differenceAccuracy(blendedData.data, sourceData.data, lastImageData.data);
                    // draw the result in the canvas
                    contextBlended.putImageData(blendedData,0,0);
                    lastImageData = sourceData;

                };

                var checkArea = function() {
                    var width = canvasSource.width;
                    var height = canvasSource.height;

                    var blendedData = contextBlended.getImageData(0,0,width,height);
                    var i = 0;
                    var average = 0;
                    while (i < blendedData.data.length / 4) {
                        // make an average of the color channels
                        average += (blendedData.data[i*4] + blendedData.data[i*4+1] + blendedData.data[i*4+2]) / 3;
                        ++i;
                    }
                    // calculate an average between of the color values of the note area
                    average = Math.round(average / (blendedData.data.length / 4));
                    if (average > $scope.$parent.movementSensivity) {
                        // over a small limit, consider that a movement is detected
                        //$scope.handleMovement();
                        //console.log("Got Movement!!!");
                        //var sourceData = contextSource.getImageData(0,0,width,height);
                        $scope.onMovement();
                    }
                };

                navigator.getMedia(
                    // ask only for video
                    {
                        video: true,
                        audio: true
                    },
                    onSuccess,
                    onFailure
                );

                /* Start streaming the webcam data when the video element can play
                 * It will do it only once
                 */
                video.addEventListener('canplay', function () {
                    if (!isStreaming) {
                        //height = (video.videoHeight / ((video.videoWidth / width))) || 250;
                        //video.setAttribute('width', width);
                        //video.setAttribute('height', height);
                        isStreaming = true;
                        // console.log('Started streaming');

                        removeLoader();

                        /* Call custom callback */
                        if ($scope.onStreaming) {
                            $scope.onStreaming({video: video});
                        }

                        update();
                    }
                }, false);
            }
        };
    });