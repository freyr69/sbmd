#Features

###Timers
* Minutes until session starts
* Minutes until release method is activated
* Snapshot interval timer


###Variables
* Minutes until session start
* Minutes until release method is activated
* Beep during countdown to start
* Show remaining random session time
* Release REST API
* Random Session
	* Use random session time
	* Min random session time
	* Max random session time
* Movement
	* Movement sensitivity
	* Minutes to add when motion is detected
	* Movements to allow before teasing and adding time
	* Movement Teasing REST API
* Sound Teasing
	* Use sound teasing
	* Sound input sensitivity
	* Time in minutes added to countdown when noise detected
	* Sound Teasing REST API
* Random teasing
	* Use random teasing
	* % probability of being teased 	
	* Random Teasing REST API

* Record Session
	* Record video of the session
	* Take snapshots of the session
		* Snapshot interval in seconds

###Events
* Tease
* Release

###APIs
* Start session
* Test Movement Tease
* Test Sound Tease
* Test Random Tease
* Test Release
* Add time to session


# Example code

### Draw a rectangle

    var canvas = document.getElementById('video');
    if (canvas.getContext) {
        var context = canvas.getContext('2d');
        context.strokeStyle="purple";
        context.strokeRect(20,20,260,260);
    }