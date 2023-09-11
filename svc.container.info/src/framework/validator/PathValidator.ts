export default class PathValidator{

    public checkPath (route: string): Array<string> {
        const regex: RegExp = /@([A-Z]+)\(([^)]+)\)/;;
        const matches: RegExpExecArray | null = regex.exec(route);
        const routeSplited: Array<string> = [];
        if (!matches) {
            throw new Error(`Error route injection ${route} is not correct route injection failed`)
        } 
        const httpMethod = matches[1]; // Extract the HTTP method (GET)
        const endpoints = matches[2].split('.'); // Split the endpoint string into parts
        const path = endpoints[0] || '';
        const controller = endpoints[1] || '';
        const result = `${httpMethod}.${path}.${controller}`;
        routeSplited.push (...result.split('.'));

    return routeSplited

    }
    
}