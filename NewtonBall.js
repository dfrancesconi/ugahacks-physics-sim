class NewtonBall
{
    constructor(scene, name, color, xpos, ypos, zpos, momentum)
    {
        this.geometry = new THREE.SphereGeometry( 1, 16, 8 );
        this.material = new THREE.MeshPhongMaterial( color );
        this.momentum = momentum;
        this.ball = new THREE.Mesh(this.geometry, this.material)
        this.ball.name = name;
        //scene.add(this.ball);
        this.origX = xpos;
        this.origY = ypos;
        this.origZ = zpos;
        this.ball.position.x = xpos;
        this.ball.position.y = ypos;
        this.ball.position.z = zpos;
        this.momentum = momentum;
        this.g = 0;
        this.trail = [];
        this.trailCount = -1;
    }

    // Collision technique referenced from http://stemkoski.github.io/Three.js/Collision-Detection.html with some modification and improvement
    checkCollision()
    {
        for (let vertexIndex = 0; vertexIndex < this.ball.geometry.vertices.length; vertexIndex++)
        {
            let localVertex = this.ball.geometry.vertices[vertexIndex].clone();
            let globalVertex = localVertex.applyMatrix4( this.ball.matrix );
            let directionVector = globalVertex.sub( this.ball.position );

            let ray = new THREE.Raycaster( this.ball.position, directionVector.clone().normalize() );
            let collisionResults = ray.intersectObjects( collidableMeshList );
            let resetResults = ray.intersectObjects( resetMeshList );
            if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() )
            {
                // Bounces (reflects) the ball off of the surface it collides with, using the "normal force" vector to calculate the final vector
                this.momentum.reflect(directionVector.clone().normalize());
                return;
            }
            if ( resetResults.length > 0 && resetResults[0].distance < directionVector.length() )
            {
                this.resetBall();
                return;
            }
        }
    }

    resetBall()
    {
        this.toggleGravity();
        this.ball.position.x = this.origX;
        this.ball.position.y = this.origY;
        this.ball.position.z = this.origZ;
        this.momentum = new THREE.Vector3(0, 0, 0);
    }

    toggleGravity()
    {
        if (this.g == 0)
        {
            this.clearTrail(scene);
            this.g = -.002;
        }
        else if (this.g == -.002)
            this.g = 0;
    }

    clearTrail(scene)
    {
        while(this.trailCount > -1)
        {
            scene.remove(this.trail.pop());
            this.trailCount--;
        }
    }

    makeTrail(scene, time)
    {
        if (this.g != 0 && (time % 7) == 0)
        {
            this.trailCount++;
            this.trail.push(new THREE.Mesh(new THREE.SphereGeometry( .2, 8, 4 ), this.material = new THREE.MeshNormalMaterial()));
            scene.add(this.trail[this.trailCount]);
            this.trail[this.trailCount].position.x = this.ball.position.x;
            this.trail[this.trailCount].position.y = this.ball.position.y;
            this.trail[this.trailCount].position.z = this.ball.position.z;
        }
    }

    update()
    {
        this.checkCollision();
        this.ball.position.x += this.momentum.x;
        this.ball.position.y += this.momentum.y;
        this.ball.position.z += this.momentum.z;
        this.momentum.add(new THREE.Vector3(0, this.g, 0));
    }


}