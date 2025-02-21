DELIMITER //

CREATE TRIGGER actualizar_PS14
BEFORE UPDATE ON EN_IFM_STANDARD
FOR EACH ROW
BEGIN
    DECLARE valor INT;

    IF NEW.machine_used = 2 THEN
        SET valor = 28;
    ELSEIF NEW.machine_used = 3 THEN
        SET valor = 51;
    ELSEIF NEW.machine_used = 4 THEN
        SET valor = 34;
    ELSEIF NEW.machine_used = 5 THEN
        SET valor = 83;
    ELSE
        SET valor = 0;
    END IF;

    IF NEW.numero_curvas IS NOT NULL AND NEW.cantidad_a_mover IS NOT NULL THEN
        SET NEW.PS14 = (valor * NEW.cantidad_a_mover);
    ELSE
        SET NEW.PS14 = 1;
    END IF;
END //

DELIMITER ;