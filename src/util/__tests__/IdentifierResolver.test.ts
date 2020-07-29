import IdentifierResolver from '../IdentifierResolver';

describe('Identifier resolver', () => {

    it('extracts normalized name into params object', () => {
        const name = 'metropolitan-plan';
        const location = 'http://onto.fel.cvut.cz/ontologies/termit/vocabulary/' + name;
        const result = IdentifierResolver.routingOptionsFromLocation(location);
        expect(result.params).toBeDefined();
        expect(result.params!.get('name')).toEqual(name);
    });

    it('extracts normalized name into params object from URI with hash fragment', () => {
        const name = 'metropolitan-plan';
        const location = 'http://onto.fel.cvut.cz/ontologies/termit/vocabulary#' + name;
        const result = IdentifierResolver.routingOptionsFromLocation(location);
        expect(result.params).toBeDefined();
        expect(result.params!.get('name')).toEqual(name);
    });

    it('extracts query param into query object when it is present in location' ,() => {
        const name = 'metropolitan-plan';
        const namespace = 'http://onto.fel.cvut.cz/ontologies/termit/vocabulary/';
        const location = 'http://kbss.felk.cvut.cz/termit/rest/' + name + "?namespace=" + namespace;
        const result = IdentifierResolver.routingOptionsFromLocation(location);
        expect(result.query).toBeDefined();
        expect(result.query!.get('namespace')).toBeDefined();
    });

    it('returns empty query map when location contains no query params', () => {
        const name = 'metropolitan-plan';
        const location = 'http://onto.fel.cvut.cz/ontologies/termit/vocabulary/' + name;
        const result = IdentifierResolver.routingOptionsFromLocation(location);
        expect(result.query!.size).toEqual(0);
    });
});