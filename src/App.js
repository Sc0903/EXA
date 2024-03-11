import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { db, storage } from './firebaseConfig';
import './styles.css';

function App() {
  const [comidas, setComidas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [nuevaComida, setNuevaComida] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    imagen: null
  });
  const [comidaActualizada, setComidaActualizada] = useState({
    id: '',
    nombre: '',
    descripcion: '',
    precio: '',
    imagen: null
  });
  const [mostrarFormularioActualizar, setMostrarFormularioActualizar] = useState(false);
  const [reloadPage, setReloadPage] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerComidas();
  }, [reloadPage]);

  const obtenerComidas = async () => {
    const comidasRef = collection(db, 'ComidasMEX');
    const q = query(comidasRef, orderBy('nombre'));
    const comidasSnapshot = await getDocs(q);
    const comidasData = [];
    await Promise.all(comidasSnapshot.docs.map(async doc => {
      const comidaData = doc.data();
      const imagenRef = ref(storage, `${doc.id}.jpg`);
      try {
        const url = await getDownloadURL(imagenRef);
        comidasData.push({ id: doc.id, ...comidaData, imagenUrl: url });
      } catch (error) {
        console.error(`Error al obtener la imagen para la comida con ID ${doc.id}:`, error);
        comidasData.push({ id: doc.id, ...comidaData, imagenUrl: null });
      }
    }));
    setComidas(comidasData);
  };

  const handleInputChange = (e) => {
    setBusqueda(e.target.value);
    setError('');
  };

  const filtrarComidas = (comidas, busqueda) => {
    return comidas.filter(comida =>
      comida.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      comida.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    );
  };

  const handleNuevaComidaChange = (e) => {
    const { name, value } = e.target;
    setNuevaComida(prevState => ({
      ...prevState,
      [name]: value
    }));
    setError('');
  };

  const handleImagenChange = (e) => {
    const imagen = e.target.files[0];
    setNuevaComida(prevState => ({
      ...prevState,
      imagen
    }));
    setError('');
  };

  const handleComidaActualizadaChange = (e) => {
    const { name, value } = e.target;
    setComidaActualizada(prevState => ({
      ...prevState,
      [name]: value
    }));
    setError('');
  };

  const mostrarFormulario = (comida) => {
    setComidaActualizada(comida);
    setMostrarFormularioActualizar(true);
    setError('');
  };

  const ocultarFormulario = () => {
    setMostrarFormularioActualizar(false);
    setError('');
  };

  const agregarComida = async () => {
    let id = null;
    try {
      const { nombre, descripcion, precio, imagen } = nuevaComida;
      // Validar que los campos no estén vacíos
      if (!nombre || !descripcion || !precio || !imagen) {
        setError('Todos los campos son obligatorios');
        return;
      }
      // Validar que el precio sea un número
      if (isNaN(parseFloat(precio))) {
        setError('El precio debe ser un número válido');
        return;
      }

      const nuevaComidaRef = await addDoc(collection(db, "ComidasMEX"), { nombre, descripcion, precio });
      id = nuevaComidaRef.id;
      const imagenRef = ref(storage, `${id}.jpg`);
      await uploadBytes(imagenRef, imagen);
      const imageUrl = await getDownloadURL(imagenRef);
      console.log("Imagen subida a Firebase Storage");

      const nuevaComidaData = {
        nombre,
        descripcion,
        precio,
        imagenUrl: imageUrl,
        imagen: `${id}.jpg`
      };

      await updateDoc(doc(db, "ComidasMEX", id), nuevaComidaData);
      console.log("Nueva comida agregada a la base de datos");

      setReloadPage(prevState => !prevState);
      // Limpiar completamente el estado nuevaComida después de agregar la comida
      setNuevaComida({ nombre: '', descripcion: '', precio: '', imagen: null });
      // Restablecer el campo de selección de archivo
      document.getElementById('file-input').value = null;
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const eliminarComida = async (id) => {
    try {
      await deleteDoc(doc(db, "ComidasMEX", id));
      console.log("Document successfully deleted!");

      await deleteObject(ref(storage, `${id}.jpg`));
      
      setReloadPage(prevState => !prevState);
    } catch (error) {
      console.error("Error removing document: ", error);
    }
  };

  const actualizarComida = async () => {
    try {
      await updateDoc(doc(db, "ComidasMEX", comidaActualizada.id), comidaActualizada);
      console.log("Document successfully updated!");
      setReloadPage(prevState => !prevState);
      ocultarFormulario();
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  return (
    <div>
      <h1>Lista de Comidas</h1>
      <input
        type="text"
        placeholder="Buscar comidas"
        value={busqueda}
        onChange={handleInputChange}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {filtrarComidas(comidas, busqueda).map(comida => (
          <li key={comida.id} className="comida">
            {comida.imagenUrl && <img src={comida.imagenUrl} alt={comida.nombre} />} {}
            <div>
              <h2>{comida.nombre}</h2>
              <p>{comida.descripcion}</p>
              <p>Precio: {comida.precio}</p>
              <button onClick={() => eliminarComida(comida.id)}>Eliminar</button>
              <button onClick={() => mostrarFormulario(comida)}>Actualizar</button>
            </div>
          </li>
        ))}
      </ul>
      <h2>Agregar nueva comida</h2>
      <input type="text" name="nombre" placeholder="Nombre" value={nuevaComida.nombre} onChange={handleNuevaComidaChange} />
      <input type="text" name="descripcion" placeholder="Descripción" value={nuevaComida.descripcion} onChange={handleNuevaComidaChange} />
      <input type="text" name="precio" placeholder="Precio" value={nuevaComida.precio} onChange={handleNuevaComidaChange} />
      {}
      <input id="file-input" type="file" accept="image/*" onChange={handleImagenChange} />
      <button onClick={agregarComida}>Agregar</button>

      {mostrarFormularioActualizar && (
        <div>
          <h2>Actualizar comida</h2>
          <input type="text" name="nombre" placeholder="Nombre" value={comidaActualizada.nombre} onChange={handleComidaActualizadaChange} />
          <input type="text" name="descripcion" placeholder="Descripción" value={comidaActualizada.descripcion} onChange={handleComidaActualizadaChange} />
          <input type="text" name="precio" placeholder="Precio" value={comidaActualizada.precio} onChange={handleComidaActualizadaChange} />
          <button onClick={actualizarComida}>Actualizar</button>
          <button onClick={ocultarFormulario}>Cancelar</button>
        </div>
      )}
    </div>
  );
}

export default App;
