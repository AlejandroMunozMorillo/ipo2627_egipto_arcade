import { ArcadeModel } from "./ArcadeModel.js";
import { ArcadeView } from "./ArcadeView.js";
import { ArcadeController } from "./ArcadeController.js";

const modelo = new ArcadeModel();
const vista = new ArcadeView();
const controlador = new ArcadeController(modelo, vista);

controlador.iniciar();