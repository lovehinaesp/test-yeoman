'use strict';

describe('Controller: LechugaCtrl', function () {

  // load the controller's module
  beforeEach(module('yeomanApp'));

  var LechugaCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    LechugaCtrl = $controller('LechugaCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
