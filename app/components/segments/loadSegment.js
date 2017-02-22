"use strict";
// get app reference
define(["angular", "components/segments/segmentStash"], function(angular) {
	angular.module("myApp").factory('LoadSegment', ['FastMath', 'Polynomial', function(fastMath, polynomialFactory) {


		var LinearLoadsEnum = Object.freeze({"FRICTION_COEFF":1, "MASS":2, "FORCE":3});
		var RotaryLoadsEnum = Object.freeze({"FRICTION":1, "INERTIA":2, "EXTERNAL_TORQUE":3});

		/**
		 * LoadSegment defines load with respect to time.
		 * loads can only be lines, ie first degree polynomials
		 * @param {Number} t0 initial Time
		 * @param {Number} tf final Time
		 * @param {Number} initVal initial load value
		 * @param {Number} finalVal final load value
		 */
		var LoadSegment = function(type, t0, tf, initVal, finalVal) {

			this.initialTime = t0;
			this.finalTime = tf;

			this.id = this.generateId();

			var slope = (finalVal - initVal)/(tf-t0);
			var iSect = initVal - slope*t0 + slope*t0;

			this.loadPoly = polynomialFactory.createPolyAbCd([0,0,slope,iSect], t0, tf);


		};

		LoadSegment.prototype.evaluateLoadAt = function(x) {
			return this.loadPoly.evaluateAt(x);
		};


		/**
		 * Generate unique id 
		 */
		LoadSegment.prototype.generateId = function() {

			var mSec = (new Date()).getTime().toString();
			var rnd = Math.floor(Math.random() * 10000).toString();

			var idStr = mSec + rnd;

			return parseInt(idStr, 10);

		};



		var factory = {};

		

		factory.createLoadSegment = function(type, t0, tf, initialLoad, finalLoad) {
			if (fastMath.lt(t0, 0) || fastMath.lt(tf, 0))
				throw new Error("initial time and final time must be greater than 0");
			if (fastMath.geq(t0, tf))
				throw new Error("final time must be greater than inital time");

			var valid = false;
			if (LinearLoadsEnum[type])
				valid = true;
			if (RotaryLoadsEnum[type])
				valid = true;

			if (valid === false)
				throw new Error("uknown load type " + type);
			var segment = new LoadSegment(type, t0, tf, initialLoad, finalLoad);
			return segment;
		};

		factory.LinearLoadsEnum = LinearLoadsEnum;
		factory.RotaryLoadsEnum = RotaryLoadsEnum;

		return factory;

	}]);
});