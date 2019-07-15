import {UserContext} from "./user-context";

describe('UserContext', () => {

    it('Ctor without parameter should create anonymous user context', () => {
        const anonUserContext = new UserContext();

        expect(anonUserContext.username).toBeUndefined();
        expect(anonUserContext.role).toBeUndefined();
        expect(anonUserContext.authenticated).toBeFalsy();
    });

    it('Anonymous context should not authorize, authorize() should produce exception', () => {
        const anonUserContext = new UserContext();

        expect(() => {
            anonUserContext.assertAuth('ANY');
        }).toThrow('403');

        expect(() => {
            anonUserContext.assertAuth('ANY', 500);
        }).toThrow('500');
    });

    it('Ctor with parameter should create IUserInfo', () => {
        const userContext = new UserContext({
            username: 'foo',
            role: 'reader',
        });

        expect(userContext.username).toEqual('foo');
        expect(userContext.role).toEqual('reader');
        expect(userContext.authenticated).toBeTruthy();
    });

    it('Not anonymous userContext should authorize if authorize params match', () => {
        const userContext = new UserContext({
            username: 'foo',
            role: 'reader',
        });

        expect(() => {
            userContext.assertAuth('ANY');
        }).not.toThrow();
        expect(() => {
            userContext.assertAuth([
                {
                    role: [
                        'reader',
                        'admin'
                    ]
                }
            ]);
        }).not.toThrow();
        expect(() => {
            userContext.assertAuth([
                {
                    username: [
                        'bar',
                        'foo'
                    ]
                }
            ]);
        }).not.toThrow();
        expect(() => {
            userContext.assertAuth([
                {
                    username: [
                        'bar',
                        'foo'
                    ]
                },
                {
                    role: [
                        'admin'
                    ]
                }
            ]);
        }).not.toThrow();
        expect(() => {
            userContext.assertAuth([
                {
                    username: [
                        'bar'
                    ]
                },
                {
                    role: [
                        'reader'
                    ]
                }
            ]);
        }).not.toThrow();
    });

    it('Not anonymous userContext should not authorize if authorize params not match', () => {
        const userContext = new UserContext({
            username: 'foo',
            role: 'reader',
        });

        expect(() => {
            userContext.assertAuth([
                {
                    role: [
                        'admin'
                    ]
                }
            ]);
        }).toThrow();
        expect(() => {
            userContext.assertAuth([
                {
                    username: [
                        'bar',
                        'bla'
                    ]
                }
            ]);
        }).toThrow();
        expect(() => {
            userContext.assertAuth([
                {
                    username: [
                        'bar',
                        'bla'
                    ]
                },
                {
                    role: [
                        'admin'
                    ]
                }
            ]);
        }).toThrow();
        expect(() => {
            userContext.assertAuth([
                {
                    username: [
                        'bla'
                    ]
                },
                {
                    role: [
                        'admin'
                    ]
                }
            ]);
        }).toThrow();
    });

});
