"use strict";
// get app reference
define(["angular","undomanager", "components/segments/segmentStash"], function(angular,UndoManager) {
	angular.module("myApp").factory('MotionSegment', ['FastMath', 'SegmentStash', function(fastMath, SegmentStash) {

		/**
		 * MotionSegment is a collection of other MotionSegments. MotionSegment(s) form the entire MotionProfile
		 * Initialize the segment with a unique id and a stash to hold other segments
		 * @param {Number} t0 initial Time
		 * @param {Number} tf final Time
		 */
		var MotionSegment = function(t0, tf) {


			this.initialTime = t0;
			this.finalTime = tf;

			this.id = this.generateId();

			//each segment can hold other segments
			this.segments = SegmentStash.makeStash();

		};



		/**
		 * Generate unique id 
		 */
		MotionSegment.prototype.generateId = function() {

			var mSec = (new Date()).getTime().toString();
			var rnd = Math.floor(Math.random() * 100).toString();

			var idStr = mSec + rnd;

			return parseInt(idStr, 10);

		};



		MotionSegment.prototype.initializeWithSegments = function(segments) {

			if (!Array.isArray(segments))
				throw new Error("Expecting array of segments. Was not an array");

			//add each segment
			for (var i = 0; i < segments.length; i++) {
				this.segments.insertAt(segments[i], null);
			}
		};



		MotionSegment.prototype.getAllSegments = function() {
			return this.segments.getAllSegments();
		};

		var factory = {};

		factory.MotionSegment = MotionSegment;

		return factory;

	}]);
});