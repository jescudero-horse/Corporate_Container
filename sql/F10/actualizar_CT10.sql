DELIMITER //

CREATE TRIGGER actualizar_CT10
BEFORE UPDATE ON EN_IFM_STANDARD
FOR EACH ROW
BEGIN
    DECLARE valor INT;

    IF NEW.machine_used IN (2, 8, 9) THEN
        SET valor = 5;
    ELSEIF NEW.machine_used = 4 THEN
        SET valor = 5;
    ELSEIF NEW.machine_used = 10 THEN
        SET valor = 8;
    ELSE
        SET valor = 0;
    END IF;
    
    IF NEW.cantidad_a_mover IS NOT NULL AND NEW.cantidad_a_mover > 0 THEN
        SET NEW.CT10 = (valor * NEW.cantidad_a_mover);
    ELSE
        SET NEW.CT10 = 0;
    END IF;
END //

DELIMITER ;
