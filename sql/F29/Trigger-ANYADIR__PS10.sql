DELIMITER //

CREATE TRIGGER actualizar_PS10
BEFORE UPDATE ON EN_IFM_STANDARD
FOR EACH ROW
BEGIN
    DECLARE valor INT;

    IF NEW.machine_used = 2 THEN
        SET valor = 19;
    ELSEIF NEW.machine_used = 3 THEN
        SET valor = 29;
    ELSEIF NEW.machine_used = 4 THEN
        SET valor = 18;
    ELSEIF NEW.machine_used = 5 THEN
        SET valor = 35;
    ELSEIF NEW.machine_used IN(6, 7) THEN
        SET valor = 17;
    ELSE
        SET valor = 0;
    END IF;

    IF NEW.numero_curvas IS NOT NULL AND NEW.cantidad_a_mover IS NOT NULL THEN
        SET NEW.PS10 = (valor * NEW.cantidad_a_mover);
    ELSE
        SET NEW.PS10 = 1;
    END IF;
END //

DELIMITER ;