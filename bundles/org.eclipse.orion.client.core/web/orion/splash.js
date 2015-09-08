/*******************************************************************************
 * @license
 * Copyright (c) 2015 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License v1.0
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html).
 *
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

/*eslint-env browser, amd*/
define([
	'orion/webui/littlelib'
], function(lib) {
	
	var _pluginCount = 0;
	
	var PROGRESS_BAR_LENGTH = 200;
	
	/* Let's say that the first 40px are reserved for initialization */
	
	var PROGRESS_INIT_LENGTH = 40;
	
	var PROGRESS_INIT_TIMEOUT = 200;
	
	
	var interval; 
	
	function startInitializationProgress(){
		interval = setInterval(function(){ showInitializationProgress() }, PROGRESS_INIT_TIMEOUT);
	}
	
	function showInitializationProgress(){
		
		var initialMessage = document.getElementById( 'initializationStep' );
		initialMessage.innerHTML = "Initializing workspace";
		
		var intialVisual = document.getElementById( 'initializationVisual');
		intialVisual.className = "loadingImage";
		
		/* Let's show some progress every 100 milliseconds */
		
		var splashProgress = lib.node("loadingProgressBar");
		
		if (splashProgress && ( splashProgress.value < PROGRESS_INIT_LENGTH ) ) {	
			
			var increment = ( PROGRESS_INIT_LENGTH - splashProgress.value )/2;
			
			splashProgress.value = splashProgress.value + increment;
		}	
	}
	
	
	function completeInitializationProgress(){
		
		clearInterval(interval);		
	}
	
	
	function pluginCount( count ){
		
		_pluginCount = count;
		console.log( 'plugin count: ' + count );
		
	}

	function progress(msg) {
		
		
	/*	var initialMessage = document.getElementById( 'initializationStep' );
		initialMessage.innerHTML = "Initialized workspace";
		
		var intialVisual = document.getElementById( 'initializationVisual');
		intialVisual.className = "successImage";
		
		var pluginsMessage = document.getElementById( 'pluginsStep' );
		pluginsMessage.innerHTML = "Loading Plugins";
		
		pluginsMessage.className = "verbal";
		
		var pluginVisual = document.getElementById( 'pluginVisual');
		pluginVisual.className = "loadingImage";
		
		completeInitializationProgress();
		
		var splashProgress = lib.node("loadingProgressBar");
		if (splashProgress) {
			
//			splashProgress.value = splashProgress.value + ( splashProgress.max - splashProgress.value ) / 2;
			
			var increment = ( PROGRESS_BAR_LENGTH - PROGRESS_INIT_LENGTH )/_pluginCount;
			
			splashProgress.value = splashProgress.value + increment;
		console.log( msg ); */
		
		
		
//		}	

		console.log( 'progress' );
		
	}

	function takeDown() {
//		var splash = lib.node("splash");
//		if (splash) {
//			splash.classList.remove("splashShown");
//		}
	}

	return {
		showInitializationProgress: showInitializationProgress,
		progress: progress,
		pluginCount: pluginCount,
		takeDown: takeDown
	};
});
