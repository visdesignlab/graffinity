describe('cmResource', () => {
  beforeEach(angular.mock.module('connectivityMatrixJs'));

  it('should exist', inject(cmResource=> {
    expect(cmResource).not.toEqual(null);
  }));
});
