import PathValidator from "../../../../framework/validator/PathValidator";

describe('PathValidator class', () => {
    let pathValidator: PathValidator;

    beforeEach(() => {
        pathValidator = new PathValidator();
    });

    it('should create a new instance', () => {
        expect(pathValidator instanceof PathValidator).toBeTruthy();
    });

    it('should have a checkPath() method', () => {
        expect(typeof pathValidator.checkPath === 'function').toBeTruthy();
    });

    it('should return an array of strings', () => {
        const route = '@GET(/mockroute.controller)';
        const result = pathValidator.checkPath(route);
        expect(Array.isArray(result)).toBeTruthy();
    });

    it('should return the correct HTTP method', () => {
        const route = '@GET(/mockroute.controller)';
        const result = pathValidator.checkPath(route);
        expect(result[0]).toBe('GET');
    });

    it('should return the correct path', () => {
        const route = '@GET(/users.controller)';
        const result = pathValidator.checkPath(route);
        expect(result[1]).toBe('/users');
    });

    it('should return the correct controller', () => {
        const route = '@GET(/mockroute.controller)';
        const result = pathValidator.checkPath(route);
        expect(result[1]).toBe('/mockroute');
    });

    it('should throw an error if the route is not valid', () => {
        const invalidRoute = '@INVALID(/invalid.route)';
        expect(() => pathValidator.checkPath(invalidRoute)).toThrowError(
            new Error(`Error route injection ${invalidRoute} is not correct route injection failed`)
        );
    });
});
