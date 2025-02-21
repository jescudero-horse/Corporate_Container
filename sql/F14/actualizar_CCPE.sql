DELIMITER //

CREATE TRIGGER actualizar_CCPE
BEFORE UPDATE ON EN_IFM_STANDARD
FOR EACH ROW
BEGIN
    DECLARE valor INT;

    IF NEW.machine_used IN (2, 3, 4, 9) THEN
        SET valor = 6;
    ELSEIF NEW.machine_used IN (6, 7) THEN
        SET valor = 7;
    ELSEIF NEW.machine_used = 10 THEN
        SET valor = 12;
    ELSE
        SET valor = 0;
    END IF;

    IF NEW.cantidad_a_mover IS NOT NULL AND NEW.cantidad_a_mover > 0 THEN
        SET NEW.CCPE = (valor * NEW.cantidad_a_mover);
    ELSE
        SET NEW.CCPE = 0;
    END IF;
END //

DELIMITER ;
