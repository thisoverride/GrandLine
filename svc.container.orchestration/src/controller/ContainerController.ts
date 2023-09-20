import { NextFunction, Request, Response } from 'express';
import { ControllerImpl } from './ControllerInterface';
import Docker from 'dockerode';

export default class ContainerController implements ControllerImpl {
    public readonly ROUTE: Array<string>;

    public constructor() {
        this.ROUTE = [
            "@POST(/container.imageBuilder)"
            // {method: "@GET",path: "/index",controller: "AppController"}
        ]
    }
    public async imageBuilder(request: Request, response: Response, next: NextFunction) {
        const { dockerfile } = request.body;
        if(dockerfile === undefined){
            return response.status(400).json({ error: 'Le champ "path" est manquant dans la requête.' });
        }
        

        const docker: Docker = new Docker();

        docker.buildImage(dockerfile, (err, stream) => {
            if (err) {
            console.error('Erreur de construction de l\'image Docker :', err);
            response.status(500).json({ error: 'Erreur de construction de l\'image Docker' });
            } else {
            // Gérez la création du container ici
            // Exemple : docker.createContainer(...)

            // Envoyez une réponse de succès
            response.json({ message: 'Docker container créé avec succès' });
            }
        });
        response.status(200).json({ status: 'Running' });
    }
}