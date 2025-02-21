DELIMITER //

CREATE TRIGGER actualizar_DL
BEFORE UPDATE ON EN_IFM_STANDARD
FOR EACH ROW
BEGIN
    DECLARE valor INT;

    IF NEW.machine_used IN (2, 3, 8, 9) THEN
        SET valor = 4;
    ELSEIF NEW.machine_used = 4 THEN
        SET valor = 3;
    ELSEIF NEW.machine_used IN (6, 7) THEN
        SET valor = 2;
    ELSEIF NEW.machine_used = 8 THEN
        SET valor = 8;
    ELSE
        SET valor = 0;
    END IF;

    IF NEW.cantidad_a_mover IS NOT NULL AND NEW.cantidad_a_mover > 0 THEN
        SET NEW.DL = (valor * NEW.cantidad_a_mover);
    ELSE
        SET NEW.DL = 0;
    END IF;
END //

DELIMITER ;
