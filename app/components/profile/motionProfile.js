/**
 * Creates MotionProfile. MotionProfile is a list of MotionSegments.
 * MotionSegments represent the various available segments in a profile, such as BasicSegment, AccelSegment,
 * CamSegment, IndexSegment, etc...
 * 
 */


"use strict";
define(["angular",
	"components/segments/motionSegment",
	"components/segments/segmentStash",
	"components/util/fastMath",
	"components/profile/profileHelper",
	"components/segments/accelSegment"
], function(angular) {
	angular.module("myApp").factory('motionProfileFactory', ['AccelSegment','MotionSegment', 'SegmentStash', 'FastMath', 'ProfileHelper',
		function(AccelSegment,MotionSegment, SegmentStash, fastMath, profileHelper) {


			/*
			MOTION PROFILE OBJECT LOGIC
			 */

			var MotionProfile = function(type) {

				this.ProfileType = "rotary";


				this.initialPosition = 0;
				this.initialVelocity = 0;

				if (type === "linear")
					this.ProfileType = "linear";

				MotionSegment.MotionSegment.call(this);
			};


			MotionProfile.prototype = Object.create(MotionSegment.MotionSegment.prototype);
			MotionProfile.prototype.constructor = MotionProfile;


			/**
			 * Set the initial position and velocity for this motion profile
			 * @param {Number} position position in [rad] or [m]
			 * @param {Number} velocity velocity in [rad/s] or [m/s]
			 */
			MotionProfile.prototype.setInitialConditions = function(position, velocity, loadMass, appliedForce, friction) {
				this.initialPosition = position;
				this.initialVelocity = velocity;

				//after setting initial conditions, all subsequent modules must be recalculated
				var current = this.segments.firstSegment();

				this.recalculateProfileSegments(current);
			};

			/**
			 * Gets all basic segments that exist in the profile. Basic Segments are the most basic building blocks
			 */
			MotionProfile.prototype.getAllBasicSegments = function() {
				var allSegments = [];
				// using associative array to hold all segments -> quick and easy to search
				this.segments.getAllSegments().forEach(function(element) {
					allSegments.push(element.getAllSegments());
				});

				// previous code gets us an array of arrays, we need to flatten it
				return allSegments.reduce(function(a, b) {
					return a.concat(b);
				});
			};


			MotionProfile.prototype.recalculateProfileSegments = function(current) {
				//nothing to do 
				if (!current)
					return;

				if (!(current instanceof MotionSegment.MotionSegment))
					throw new Error('expecting a MotionSegment type');

				var prev, previousValues;
				while (current) {
					prev = this.segments.getPreviousSegment(current.id);

					//handle first segment
					if (!prev) {
						previousValues = [0, 0, this.initialVelocity, this.initialPosition];
					} else
						previousValues = prev.getFinalValues();

					current.modifyInitialValues(previousValues[0], previousValues[1], previousValues[2], previousValues[3]);

					//move next
					current = this.segments.getNextSegment(current.id);
				}
			};


			MotionProfile.prototype.getAllSegments = function() {
				return this.segments.getAllSegments();
			};


			/**
			 * Checks and returns if exists an existing segment beginning at time initialTime
			 * @param {number} initialTime initial time of segment to check
			 * @returns {MotionSegment} existing segment or null if none found
			 */
			MotionProfile.prototype.getExistingSegment = function(initialTime) {

				return this.segments.findSegmentWithInitialTime(initialTime);
			};

			/**
			 * Inserts or appends a segment into the motion profile
			 * @param {MotionSegment} segment Segment to insert into the profile
			 */
			MotionProfile.prototype.insertSegment = function(segment, segmentId) {

				if (!(segment instanceof MotionSegment.MotionSegment))
					throw new Error('Attempting to insert an object which is not a MotionSegment');

				//need to get final values of previous segment
				var prev = this.segments.getPreviousSegment(segmentId);

				//modify the segment being inserted to make sure initial values == previous segment's final values
				var lastValues = prev.getFinalValues();
				segment.modifyInitialValues(lastValues[0], lastValues[1], lastValues[2], lastValues[3]);

				var newSegment = this.segments.insertAt(segment, segmentId);
				if (!newSegment)
					throw new Error("inserting a segment failed");

				//after inserting a segment, all subsequent segments must be recalculated
				var current = this.segments.getNextSegment(newSegment.id);
				this.recalculateProfileSegments(current);

			};

			/**
			 * Append segment at the end of the current profile
			 * @param  {[type]} segment [description]
			 * @return {[type]}         [description]
			 */
			MotionProfile.prototype.appendSegment = function(segment) {
				if (!(segment instanceof MotionSegment.MotionSegment))
					throw new Error('Attempting to insert an object which is not a MotionSegment');

				// even though we append at the end, still have to make sure that initial/final conditions are satisfied

				var lastSegment = this.segments.lastSegment();
				if (lastSegment) {
					var lastValues = lastSegment.getFinalValues();
					segment.modifyInitialValues(lastValues[0], lastValues[1], lastValues[2], lastValues[3]);
				}

				this.segments.insertAt(segment, null);
			};


			/**
			 * Deletes specified segment. Suppose we have segments 1, 2 and 3 and want to delete 2.
			 * 	First, we delete segment 2. Then, we modify the initial values of segment 3 to be the final values of segment 1
			 * @param {MotionSegment} segmentId identify segment to delete
			 */
			MotionProfile.prototype.deleteSegment = function(segmentId) {

				if (!fastMath.isNumeric(segmentId) || fastMath.lt(segmentId, 0))
					throw new Error('expect segmentId to be a positive integer');

				var previous = this.segments.getPreviousSegment(segmentId);
				var current = this.segments.getNextSegment(segmentId);

				var segToDelete = this.segments.delete(segmentId);
				if (!segToDelete)
					throw new Error("Unable to delete segment with id " + segmentId);

				//could be the only segment
				if (this.segments.countSegments() === 0)
					return segToDelete;

				this.recalculateProfileSegments(current);


				return segToDelete;

			};


	        /**
	         * 
	         * @param {int} segmentId 
	         * @param {Object} newSegmentData new segment data
	         * @param {Object} initialConditions initial conditions for the modified segment
	         * @returns {MotionSegment} 
	         */
	        MotionProfile.prototype.modifySegmentValues = function(segmentId, newSegmentData, initialConditions) {
	            var segment = this.findById(segmentId);
	            if (!segment)
	                throw new Error("Unable to find segment with id " + segmentId);

	            var modified = segment.modifySegmentValues(newSegmentData, initialConditions);

	            return modified;


	        };



	        MotionProfile.prototype.findById = function(segmentId) {
	            return this.segments.findById(segmentId);
	        };



			var factory = {};


			factory.createMotionProfile = function(type) {
				return new MotionProfile(type);
			};

			factory.createAccelSegment=function(type, segment) {
				if(!type)
					throw new Error('Need type of segment to create');

				if(!segment)
					throw new Error("Need segment data to create a segment");

				switch(type)
				{
					case "time-distance":
						return AccelSegment.MakeFromTimeDistance(segment.t0, segment.tf, segment.p0, segment.v0, segment.pf, segment.jPct, segment.mode);
					case "time-velocity":
						return AccelSegment.MakeFromTimeVelocity(segment.t0, segment.tf, segment.p0, segment.v0, segment.vf, segment.jPct, segment.mode);

					default:
						throw new Error("segment type not supported");
				}

			};


			return factory;

		}
	]);
});