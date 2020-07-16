const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const {check, validationResult} = require('express-validator');

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json({message: 'API REST para manejar usuarios'});
});

app.get('/users', (req, res) => {
    fs.readFile(path.join(__dirname, 'users.json'), (error, data) => {
        if(error){
            res.status(400).json({
                message: "No se ha podido leer la base de datos"
            });
        }else{
            res.status(200).json({
                data: JSON.parse(data.toString())
            });
        }
    });
});

app.post('/users', [
    check('name').isLength({min: 1}),
    check('lastname').isLength({min: 1}),
    check('email', 'El email ingresado es invalido').isEmail(),
    check('password', 'La contraseña debe de tener una longitud minima de 6 caracteres').isLength({min: 6}),
], (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(400).json(errors)
    }else{
        let user = {...req.body};
        let users =  [];
        fs.readFile(path.join(__dirname, 'users.json'), (error, data) => {
            if(error){
                res.status(400).json({
                    message: "No se ha podido leer la base de datos"
                });
            }else{
                users = JSON.parse(data.toString());
                if(users.some( userObj => userObj.email === user.email)){
                    res.status(400).json({message: "El usuario ya se encuentra registrado"});
                }else{
                    let nextId = users.length > 0 ? users[users.length-1].id + 1 : 1;
                    req.body.id = nextId;
                    users.push(req.body);
                    fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(users), (error) => {
                        if(error){
                            res.status(400).json({error: 'Hubo un error al agregar el usuario en el sistema'});
                        }else{
                            res.status(200).json({message: 'El usuario ha sido agregado satisfactoriamente', data: req.body});
                        }
                    });
                }
            }
        });
    }
})


app.delete('/user/:id', (req, res) => {
    let id = req.params.id;
    let users =  [];
    fs.readFile(path.join(__dirname, 'users.json'), (error, data) => {
        if(error){
            res.status(400).json({
                message: "No se ha podido leer la base de datos"
            });
        }else{
            users = JSON.parse(data.toString());
            let position = users.findIndex(user => user.id === id);
            if(position>=0){
                users.splice(position, 1);
                fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(users), (error) => {
                    if(error){
                        res.status(400).json({error: 'Hubo un error al eliminar al usuario en el sistema'});
                    }else{
                        res.status(200).json({message: 'El usuario ha sido eliminado correctamente', data: req.body});
                    }
                });
            }else{
                res.status(400).json({error: 'Hubo un error al eliminar al usuario en el sistema'});
            }
        }
    });
})

app.listen(port, () => console.log("servidor escuchando sobre el puerto 8000"));