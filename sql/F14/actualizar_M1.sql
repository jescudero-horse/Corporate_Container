DELIMITER //

CREATE TRIGGER actualizar_M1
BEFORE UPDATE ON EN_IFM_STANDARD
FOR EACH ROW
BEGIN
    DECLARE valor DECIMAL (3, 2);

    IF NEW.machine_used IN (2, 3, 4) THEN
        SET valor = 6.5;
    ELSEIF NEW.machine_used = 7 THEN
        SET valor = 7;
    ELSEIF NEW.machine_used IN (9, 10) THEN
        SET valor = 5.5;
    ELSE
        SET valor = 0;
    END IF;

    IF NEW.cantidad_a_mover IS NOT NULL AND NEW.cantidad_a_mover > 0 THEN
        SET NEW.M1 = (valor * NEW.cantidad_a_mover);
    ELSE
        SET NEW.M1 = 0;
    END IF;
END //

DELIMITER ;
