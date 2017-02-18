"use strict";
/**
 * SegmentStash is the backing data structure for low level segment operations.
 * A motion profile is really a sorted array of MotionSegments. Some MotionSegments may contain other MotionSegments
 *
 * Also, in order to speed up search and insert/delete operation, two data structures are used:
 * linked list - insert
 * hashmap(array) - searching
 * 
 */


define(["angular", "components/util/fastMath", "components/util/linkedList"], function(angular) {
	angular.module("myApp").factory('SegmentStash', ['FastMath', 'LinkedList', function(FastMath, LinkedList) {


		var SegmentStash = function() {

			/**
			 * [nodesHash description]
			 * @type {Object} associative array of nodes. Each node contains a motion segment
			 */
			this.nodesHash = {};

			this.segmentsList = LinkedList.makeLinkedList();

		};

		/**
		 * Inserts a segment in front of another segment identified by segmentId
		 * @param {MotionSegment} segment   Segment to insert
		 * @param {integer} segmentId segment Id of segment to insert in front of. If null, add at the end
		 */
		SegmentStash.prototype.insertAt = function(segment, segmentId) {
			if (!segment)
				throw new Error("Insert expects segment to be not null!");

			var newNode;

			if (segmentId) { //there needs to be an existing node with this id
				var existingNode = this.nodesHash[segmentId];
				if (!existingNode)
					return null;

				newNode = this.segmentsList.insertAt(existingNode, segment);

			} else {
				newNode = this.segmentsList.add(segment);
			}

			this.nodesHash[segment.id] = newNode;
			return segment;



		};


		SegmentStash.prototype.findById = function(segmentId) {
			var node = this.nodesHash[segmentId];
			if (node)
				return this.nodesHash[segmentId].data;
		};


		SegmentStash.prototype.getNextSegment = function(segmentId) {
			var node = this.nodesHash[segmentId];
			if (node && node.next)
				return node.next.data;
			return null;
		};

		SegmentStash.prototype.getPreviousSegment = function(segmentId) {
			var node = this.nodesHash[segmentId];
			if (node && node.previous)
				return node.previous.data;
			return null;
		};


		/**
		 * Gets all segments currently in the stash
		 * @returns {Array} array of MotionSegment
		 */
		SegmentStash.prototype.getAllSegments = function() {

			return this.segmentsList.getDataArray();

		};

		/**
		 * Clears all segments in the stash
		 */
		SegmentStash.prototype.clearAllSegments = function() {
			this.nodesHash = {};
			this.segmentsList.clearAll();
		};

		/**
		 * Deletes segment specified by segment id
		 * @param {Number} segmentId 
		 */
		SegmentStash.prototype.delete = function(segmentId) {
			if (!FastMath.isNumeric(segmentId) || FastMath.lt(0))
				throw new Error("Delete expects id to be a number >=0");

			var nodeToDel = this.nodesHash[segmentId];
			if (!nodeToDel)
				return null;

			var deletedNode = nodeToDel;
			delete this.nodesHash[segmentId];

			this.segmentsList.removeNode(nodeToDel);

			return nodeToDel.data;

		};

		/**
		 * Gets the last segment
		 * @return {MotionSegment} last segment in the list
		 */
		SegmentStash.prototype.lastSegment = function() {
			if (this.segmentsList.tail)
				return this.segmentsList.tail.data;
			return null;
		};


		SegmentStash.prototype.firstSegment = function() {
			if (this.segmentsList.head)
				return this.segmentsList.head.data;
			return null;
		};



		SegmentStash.prototype.countSegments = function() {
			return this.segmentsList.length();
		};

		/**
		 * Find segment within the stash that starts with the specified time
		 * @param  {Number} initialTime initial time
		 * @return {MotionSegment}             segment that starts with the specified initial time
		 */
		SegmentStash.prototype.findSegmentWithInitialTime = function(initialTime) {


			var currentNode = this.segmentsList.head;


			// 2nd use-case: a valid position
			while (currentNode) {


				if (FastMath.equal(initialTime, currentNode.data.initialTime))
					return currentNode.data;

				currentNode = currentNode.next;
			}


			return null;

		};


		SegmentStash.prototype.initializeWithSegments = function(segments) {
			if (!Array.isArray(segments))
				throw new Error("expecting an array of MotionSegments");

			this.clearAllSegments();

			for (var i = 0; i < segments.length; i++) {
				this.insertAt(segments[i], null);
			}

		};


		var factory = {};

		factory.makeStash = function() {
			return new SegmentStash();
		};

		return factory;

	}]);
});