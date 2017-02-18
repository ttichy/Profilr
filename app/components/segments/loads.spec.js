"use strict";
define([
  "angularMocks",
   "components/segments/basicSegment",
   "components/segments/accelSegment"],
    function() {



  describe('Unit: basicSegmentFactory load testing', function() {

    var basicSegmentFactory,accelSegmentFactory;

    beforeEach(function() {
      module('myApp');

      inject(function(_basicSegmentFactory_, _AccelSegment_) {
        basicSegmentFactory = _basicSegmentFactory_;
        accelSegmentFactory = _AccelSegment_;
      });
    });


    it('should directly create a basic segment [1,1], [2,2] with loads', function() {

      var loads = {};
      loads.friction = 1;
      loads.load = 2;
      loads.thrust = 3;


      var seg = basicSegmentFactory.CreateBasicSegment(1, 2, [-0.5, 0, 1.5, 1], loads);

      expect(seg.friction).toBe(loads.friction);
      expect(seg.load).toBe(loads.load);
      expect(seg.thrust).toBe(loads.thrust);

    });


    it('should create accel segment with segment loads and its basic segments should have the same load', function() {

      var loads = {};
      loads.friction = 1;
      loads.load = 2;
      loads.thrust = 3;

      var seg = accelSegmentFactory.MakeFromTimeVelocity(0, 2, 0, 0, 10, 0.5, "incremental",loads);


      var basicSegments  = seg.getAllSegments();

      expect(basicSegments[0].friction).toBe(loads.friction);
      expect(basicSegments[0].load).toBe(loads.load);
      expect(basicSegments[0].thrust).toBe(loads.thrust);


      expect(basicSegments[1].friction).toBe(loads.friction);
      expect(basicSegments[1].load).toBe(loads.load);
      expect(basicSegments[1].thrust).toBe(loads.thrust);

      expect(basicSegments[2].friction).toBe(loads.friction);
      expect(basicSegments[2].load).toBe(loads.load);
      expect(basicSegments[2].thrust).toBe(loads.thrust);


    });


  });
});