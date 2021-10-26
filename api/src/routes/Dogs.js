const { Router } = require('express');
const axios = require('axios')
const {Dog} = require ('../db')
const {API_KEY} = process.env
const router = Router();
const { Op } = require("sequelize");


// GET /dogs:
// Obtener un listado de las razas de perro
// Debe devolver solo los datos necesarios para la ruta principal
//  GET /dogs?name="...":
// Obtener un listado de las razas de perro que contengan la palabra ingresada como query parameter
// Si no existe ninguna raza de perro mostrar un mensaje adecuado
router.get("/", async (req, res, next) => {
  //Creo las variables de entorno
  let nameDog = req.query.name;
  let dogApi;
  let dogDb;
 
  //Buscamos un dog por nombre
  if (nameDog) {
    dogApi = await axios.get(
      `https://api.thedogapi.com/v1/breeds/search?q=${nameDog}` //obtengo api con el match de nombre
    );
    dogDb = Dog.findAll({
      where: {
        name: {
          [Op.iLike]: "%" + nameDog + "%", // matcheo 
        },
      },
      order: [["name", "ASC"]], // ordeno ascendente
    });
  } //si no traemos toda la lista de dogs 
  else {
    dogApi = await axios.get(
      `https://api.thedogapi.com/v1/breeds?api_key=${API_KEY}` //obtengo api
    );
    dogDb = Dog.findAll(); // llamo a la DATABASE
  }

  Promise.all([dogApi, dogDb]).then((respuesta) => {
    const [dogApi, dogDb] = respuesta; // RESPUESTA DE LA API
    let allDogs = [...dogApi.data, ...dogDb]; // CONCATENO API Y DATABASE
    //
    allDogs.sort((a, b) => (a.name > b.name ? 1 : -1));
    res.status(200).send(allDogs);
  });
}); 


// GET /dogs/{idRaza}:
// Obtener el detalle de una raza de perro en particular
// Debe traer solo los datos pedidos en la ruta de detalle de raza de perro
// Incluir los temperamentos asociados
router.get('/:id' , async (req , res ,next) => {
  const parametro =  parseInt(req.params.id)
  dogApi = await axios.get(
    `https://api.thedogapi.com/v1/breeds?api_key=${API_KEY}` //obtengo api
  );
  console.log(dogApi.id);
  dogFilter = dogApi.data.find(e => e.id === parametro)
  return res.send(dogFilter); //{datos}
  //let dog = await Dog.findByPk(idRaza);
  
});



// POST /dog:
// Recibe los datos recolectados desde el formulario controlado de la ruta de creación de raza de perro por body
// Crea una raza de perro en la base de datos
router.post('/', async (req, res, next) =>{
  try{
    const {name, height, weight, yearsOfLife, img} = req.body; // traer parametros de la tabla
  const newDog = await Dog.create({ //creamos un nuevo dog
    name,
    height,
    weight,
    yearsOfLife,
    img
  })
  return res.status(200).send(newDog);
  //reporta algun error
  }catch(err){
    next(err)
  }
  
})

module.exports = router;
