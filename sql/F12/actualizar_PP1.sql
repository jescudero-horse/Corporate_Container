DELIMITER //

CREATE TRIGGER actualizar_PP1
BEFORE UPDATE ON EN_IFM_STANDARD
FOR EACH ROW
BEGIN
    DECLARE valor INT;

    IF NEW.machine_used IN (2, 3, 4, 8, 9) THEN
        SET valor = 12;
    ELSEIF NEW.machine_used IN (6, 7) THEN
        SET valor = 8;
    ELSEIF NEW.machine_used = 10 THEN
        SET valor = 20;
    ELSE
        SET valor = 0;
    END IF;

    IF NEW.cantidad_a_mover IS NOT NULL AND NEW.cantidad_a_mover > 0 THEN
        SET NEW.PP1 = (valor * NEW.cantidad_a_mover);
    ELSE
        SET NEW.PP1 = 0;
    END IF;
END //

DELIMITER ;
