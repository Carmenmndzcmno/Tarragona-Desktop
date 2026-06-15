<?php
class Database {
    private $host = "";
    private $user = "";
    private $pass = "";
    private $dbname = "";
    private $conn;
    public $error = null;

    public function __construct() {
        mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
        try {
            try {
                $this->conn = new mysqli($this->host, $this->user, $this->pass);
            } catch (mysqli_sql_exception $e) {
                $this->conn = new mysqli($this->host, "root", "");
            }
            $this->conn->query("CREATE DATABASE IF NOT EXISTS $this->dbname");
            $this->conn->select_db($this->dbname);
            $this->checkTables();
        } catch (mysqli_sql_exception $e) {
            $this->error = "Aviso: No se pudo establecer la conexión automática. Detalle: " . $e->getMessage();
        }
    }

    private function checkTables() {
        $result = $this->conn->query("SHOW TABLES LIKE 'usuarios'");
        if ($result->num_rows == 0) {
            $sql = file_get_contents('php/schema.sql');
            $this->conn->multi_query($sql);
            while ($this->conn->next_result()) {;} 
            $this->importCSVs();
        }
    }

    private function importCSVs() {
        $tablas = ['usuarios', 'categorias', 'recursos', 'horarios'];
        foreach ($tablas as $tabla) {
            if (($handle = fopen("php/$tabla.csv", "r")) !== FALSE) {
                fgetcsv($handle);
                while (($data = fgetcsv($handle)) !== FALSE) {
                    $values = "'" . implode("','", array_map([$this->conn, 'real_escape_string'], $data)) . "'";
                    $this->conn->query("INSERT IGNORE INTO $tabla VALUES ($values)");
                }
                fclose($handle);
            }
        }
    }

    public function getConnection() {
        return $this->conn;
    }
}

class GestorUsuarios {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function registrar($nombre, $email, $password) {
        $conn = $this->db->getConnection();
        $email_esc = $conn->real_escape_string($email);
        $res = $conn->query("SELECT id FROM usuarios WHERE email = '$email_esc'");
        if ($res->num_rows > 0) return false;

        $nombre = $conn->real_escape_string($nombre);
        $passHash = password_hash($password, PASSWORD_DEFAULT);
        $sql = "INSERT INTO usuarios (nombre, email, password) VALUES ('$nombre', '$email_esc', '$passHash')";
        return $conn->query($sql);
    }

    public function login($email, $password) {
        $conn = $this->db->getConnection();
        $email = $conn->real_escape_string($email);
        $result = $conn->query("SELECT * FROM usuarios WHERE email = '$email'");
        if ($result && $result->num_rows > 0) {
            $user = $result->fetch_assoc();
            if (password_verify($password, $user['password'])) {
                return $user;
            }
        }
        return false;
    }
}

class GestorReservas {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getRecursos() {
        $conn = $this->db->getConnection();
        return $conn->query("SELECT r.*, c.nombre as categoria FROM recursos r JOIN categorias c ON r.id_categoria = c.id");
    }

    public function getHorarios($id_recurso) {
        $conn = $this->db->getConnection();
        return $conn->query("SELECT * FROM horarios WHERE id_recurso = $id_recurso");
    }

    public function realizarReserva($id_usuario, $id_recurso, $id_horario, $plazas) {
        $conn = $this->db->getConnection();
        $res = $conn->query("SELECT precio FROM recursos WHERE id = $id_recurso");
        $recurso = $res->fetch_assoc();
        $total = $recurso['precio'] * $plazas;
        $sql = "INSERT INTO reservas (id_usuario, id_recurso, id_horario, plazas, total) VALUES ($id_usuario, $id_recurso, $id_horario, $plazas, $total)";
        return $conn->query($sql);
    }

    public function getReservasUsuario($id_usuario) {
        $conn = $this->db->getConnection();
        return $conn->query("SELECT r.*, rec.nombre as recurso, h.fecha_inicio FROM reservas r JOIN recursos rec ON r.id_recurso = rec.id JOIN horarios h ON r.id_horario = h.id WHERE r.id_usuario = $id_usuario");
    }

    public function anularReserva($id_reserva, $id_usuario) {
        $conn = $this->db->getConnection();
        return $conn->query("DELETE FROM reservas WHERE id = $id_reserva AND id_usuario = $id_usuario");
    }
}

session_start();
$database = new Database();
$usuarios = new GestorUsuarios($database);
$reservas = new GestorReservas($database);
$mensaje = $database->error ?? "";

if (!$database->error && $_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['registro'])) {
        if ($usuarios->registrar($_POST['nombre'], $_POST['email'], $_POST['password'])) {
            $mensaje = "Confirmación: Registro realizado con éxito.";
        } else {
            $mensaje = "Error: El usuario ya existe.";
        }
    } elseif (isset($_POST['login'])) {
        $user = $usuarios->login($_POST['email'], $_POST['password']);
        if ($user) {
            $_SESSION['user'] = $user;
            $mensaje = "Confirmación: Bienvenido, " . $user['nombre'];
        } else {
            $mensaje = "Error: Credenciales incorrectas.";
        }
    } elseif (isset($_POST['reservar']) && isset($_SESSION['user'])) {
        if ($reservas->realizarReserva($_SESSION['user']['id'], $_POST['id_recurso'], $_POST['id_horario'], $_POST['plazas'])) {
            $mensaje = "Confirmación: Reserva guardada.";
        }
    } elseif (isset($_POST['anular']) && isset($_SESSION['user'])) {
        if ($reservas->anularReserva($_POST['id_reserva'], $_SESSION['user']['id'])) {
            $mensaje = "Confirmación: Reserva anulada.";
        }
    } elseif (isset($_POST['logout'])) {
        session_destroy();
        header("Location: reservas.php");
        exit;
    }
}
?>
<!DOCTYPE HTML>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <title>Tarragona-Desktop</title>
    <meta name="author" content="Carmen Méndez Camino"/>
    <meta name="description" content="Gestión de reservas de Tarragona-Desktop"/>
    <meta name="keywords" content="Reservas, Tarragona"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <link rel="stylesheet" type="text/css" href="estilo/estilo.css" />
    <link rel="stylesheet" type="text/css" href="estilo/layout.css" />
    <link rel="icon" href="multimedia/favicon.ico"/>
</head>
<body>
    <header>
        <h1><a href="index.html" title="Inicio de Tarragona-Desktop">Tarragona-Desktop</a></h1>
        <nav>
            <a href="index.html" title="Inicio de Tarragona-Desktop">Inicio</a>
            <a href="gastronomia.html" title="Información de la Gastronomia">Gastronomía</a>
            <a href="rutas.html" title="Información sobre rutas">Rutas</a>
            <a href="meteorologia.html" title="Información sobre meteorología">Meteorología</a>
            <a href="juego.html" title="Información sobre juego">Juego</a>
            <a href="reservas.php" title="Información sobre las reservas">Reservas</a>
            <a href="ayuda.html" title="Ayuda de Tarragona-Desktop">Ayuda</a>
        </nav>
    </header>
    <p>Usted está en: <a href="index.html" title="Migaja de Inicio">Inicio</a> >> Reservas</p>
    <main>
        <section>
            <h2>Central de Reservas Turísticas</h2>
            
            <?php if ($mensaje): ?>
                <p><?php echo $mensaje; ?></p>
            <?php endif; ?>

            <?php if (!isset($_SESSION['user'])): ?>
                <section>
                    <h3>Acceso y Registro de Usuarios</h3>
                    <form method="post">
                        <fieldset>
                            <legend>Iniciar Sesión</legend>
                            <p>
                                <label>Email: <input type="email" name="email" required /></label><br>
                                <label>Contraseña: <input type="password" name="password" required /></label><br>
                                <button type="submit" name="login">Entrar</button>
                            </p>
                        </fieldset>
                    </form>
                    <form method="post">
                        <fieldset>
                            <legend>Registrar Nuevo Usuario</legend>
                            <p>
                                <label>Nombre: <input type="text" name="nombre" required /></label><br>
                                <label>Email: <input type="email" name="email" required /></label><br>
                                <label>Contraseña: <input type="password" name="password" required /></label><br>
                                <button type="submit" name="registro">Registrarse</button>
                            </p>
                        </fieldset>
                    </form>
                </section>
            <?php else: ?>
                <section>
                    <h3>Panel de Usuario: <?php echo $_SESSION['user']['nombre']; ?></h3>
                    <form method="post">
                        <p><button type="submit" name="logout">Cerrar Sesión</button></p>
                    </form>
                </section>

                <section>
                    <h3>Reserva de Recursos Turísticos</h3>
                    <form method="post">
                        <p>
                            <label>Elegir Recurso: 
                                <select name="id_recurso" onchange="this.form.submit()">
                                    <option value="">-- Seleccione --</option>
                                    <?php 
                                    $lista = $reservas->getRecursos();
                                    $precio_actual = 0;
                                    while($r = $lista->fetch_assoc()): 
                                        $es_seleccionado = (isset($_POST['id_recurso']) && $_POST['id_recurso'] == $r['id']);
                                        $sel = $es_seleccionado ? 'selected' : '';
                                        if ($es_seleccionado) $precio_actual = $r['precio'];
                                    ?>
                                        <option value="<?php echo $r['id']; ?>" data-precio="<?php echo $r['precio']; ?>" <?php echo $sel; ?>>
                                            <?php echo $r['nombre']; ?> (<?php echo $r['precio']; ?>€)
                                        </option>
                                    <?php endwhile; ?>
                                </select>
                            </label>
                        </p>
                    </form>

                    <?php if (isset($_POST['id_recurso']) && !empty($_POST['id_recurso'])): ?>
                        <form method="post">
                            <fieldset>
                                <legend>Confirmar Disponibilidad</legend>
                                <p>
                                    <input type="hidden" name="id_recurso" value="<?php echo $_POST['id_recurso']; ?>" />
                                    <label>Horario:
                                        <select name="id_horario" required>
                                            <option value="">-- Seleccione un horario --</option>
                                            <?php 
                                            $h_list = $reservas->getHorarios($_POST['id_recurso']);
                                            while($h = $h_list->fetch_assoc()): ?>
                                                <option value="<?php echo $h['id']; ?>">
                                                    <?php echo $h['fecha_inicio']; ?>
                                                </option>
                                            <?php endwhile; ?>
                                        </select>
                                    </label><br>
                                    <label>Número de plazas: <input type="number" name="plazas" id="plazas" min="1" value="1" required oninput="calcularPresupuesto()" /></label><br>
                                    <p>Presupuesto estimado: <span id="presupuesto"><?php echo $precio_actual; ?></span>€</p>
                                    <button type="submit" name="reservar">Confirmar Reserva</button>
                                </p>
                            </fieldset>
                        </form>

                        <script>
                            function calcularPresupuesto() {
                                const select = document.querySelector('select[name="id_recurso"]');
                                const option = select.options[select.selectedIndex];
                                const precio = parseFloat(option.getAttribute('data-precio')) || 0;
                                const plazas = parseInt(document.getElementById('plazas').value) || 0;
                                const total = precio * plazas;
                                document.getElementById('presupuesto').textContent = total.toFixed(2);
                            }
                            // Inicializar por si ya hay valores
                            window.onload = calcularPresupuesto;
                        </script>
                    <?php endif; ?>
                </section>

                <section>
                    <h3>Tus Recursos Reservados</h3>
                    <?php 
                    $mis_res = $reservas->getReservasUsuario($_SESSION['user']['id']);
                    if ($mis_res->num_rows > 0): ?>
                        <table>
                            <thead>
                                <tr>
                                    <th>Recurso</th>
                                    <th>Fecha</th>
                                    <th>Plazas</th>
                                    <th>Total</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php while($mr = $mis_res->fetch_assoc()): ?>
                                    <tr>
                                        <td><?php echo $mr['recurso']; ?></td>
                                        <td><?php echo $mr['fecha_inicio']; ?></td>
                                        <td><?php echo $mr['plazas']; ?></td>
                                        <td><?php echo $mr['total']; ?>€</td>
                                        <td>
                                            <form method="post">
                                                <p>
                                                    <input type="hidden" name="id_reserva" value="<?php echo $mr['id']; ?>" />
                                                    <button type="submit" name="anular">Anular</button>
                                                </p>
                                            </form>
                                        </td>
                                    </tr>
                                <?php endwhile; ?>
                            </tbody>
                        </table>
                    <?php else: ?>
                        <p>No tienes reservas registradas actualmente.</p>
                    <?php endif; ?>
                </section>
            <?php endif; ?>

            <section>
                <h3>Listado de Recursos Turísticos Disponibles</h3>
                <?php if (!$database->error): ?>
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Tipo</th>
                            <th>Descripción</th>
                            <th>Ocupación Máxima</th>
                            <th>Precio</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php 
                        $lista = $reservas->getRecursos();
                        while($r = $lista->fetch_assoc()): ?>
                            <tr>
                                <td><?php echo $r['nombre']; ?></td>
                                <td><?php echo $r['categoria']; ?></td>
                                <td><?php echo $r['descripcion']; ?></td>
                                <td><?php echo $r['capacidad']; ?></td>
                                <td><?php echo $r['precio']; ?>€</td>
                            </tr>
                        <?php endwhile; ?>
                    </tbody>
                </table>
                <?php else: ?>
                    <p>Información no disponible actualmente.</p>
                <?php endif; ?>
            </section>
        </section>
    </main>
</body>
</html>
