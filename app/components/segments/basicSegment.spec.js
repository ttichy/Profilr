"use strict";
define(["angularMocks", "components/segments/basicSegment"], function() {


  describe('Unit: basicSegmentFactory testing', function() {

    var basicSegmentFactory;

    beforeEach(function() {
      module('myApp');

      inject(function(_basicSegmentFactory_) {
        basicSegmentFactory = _basicSegmentFactory_;
      });
    });


    it('should create a basic segment [0,0], [1,1] and correctly evalute position and velocities', function() {

      // https://www.desmos.com/calculator/kihyp1kjux

      var seg = basicSegmentFactory.CreateBasicSegment(0, 1, [-0.5, 1.5, 0, 0]);

      expect(seg.evaluatePositionAt(0)).toBe(0);
      expect(seg.evaluatePositionAt(1)).toBe(1.0);
      expect(seg.evaluatePositionAt(0.5)).toBeCloseTo(0.3125, 3);


      expect(seg.evaluateVelocityAt(0)).toBe(0);
      expect(seg.evaluateVelocityAt(1)).toBe(1.5);
      expect(seg.evaluateVelocityAt(0.5)).toBe(1.125);


      expect(seg.evaluateAccelerationAt(0)).toBe(3);
      expect(seg.evaluateAccelerationAt(1)).toBe(0);
      expect(seg.evaluateAccelerationAt(0.5)).toBe(1.5);


      expect(seg.evaluateJerkAt(0)).toBe(-3);
      expect(seg.evaluateJerkAt(1)).toBe(-3);
      expect(seg.evaluateJerkAt(0.5)).toBe(-3);


    });


    it('should create a basic segment [1,1], [2,2] and correctly evalute position and velocities', function() {
      var seg = basicSegmentFactory.CreateBasicSegment(1, 2, [-0.5, 0, 1.5, 1]);

      expect(seg.evaluatePositionAt(1)).toBe(1.0);
      expect(seg.evaluatePositionAt(1.5)).toBeCloseTo(1.688, 3);
      expect(seg.evaluatePositionAt(2)).toBe(2);


      expect(seg.evaluateVelocityAt(1)).toBe(1.5);
      expect(seg.evaluateVelocityAt(1.5)).toBe(1.125);
      expect(seg.evaluateVelocityAt(2)).toBe(0);


      expect(seg.evaluateAccelerationAt(1)).toBe(0);
      expect(seg.evaluateAccelerationAt(1.5)).toBe(-1.5);
      expect(seg.evaluateAccelerationAt(2)).toBe(-3);


      expect(seg.evaluateJerkAt(1)).toBe(-3);
      expect(seg.evaluateJerkAt(1.5)).toBe(-3);
      expect(seg.evaluateJerkAt(2)).toBe(-3);



    });


    it('should create a basic segment [1,1], [2,2] with loads', function() {

      var loads = {};
      loads.friction = 1;
      loads.load = 2;
      loads.thrust = 3;


      var seg = basicSegmentFactory.CreateBasicSegment(1, 2, [-0.5, 0, 1.5, 1], loads);

      expect(seg.friction).toBe(loads.friction);
      expect(seg.load).toBe(loads.load);
      expect(seg.thrust).toBe(loads.thrust);



    });


  });



});