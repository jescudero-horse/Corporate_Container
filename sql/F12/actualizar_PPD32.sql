DELIMITER //

CREATE TRIGGER actualizar_PPD32
BEFORE UPDATE ON EN_IFM_STANDARD
FOR EACH ROW
BEGIN
    DECLARE valor INT;

    IF NEW.machine_used = 2 THEN
        SET valor = 19;
    ELSEIF NEW.machine_used = 18 THEN
        SET valor = 4;
    ELSE
        SET valor = 0;
    END IF;

    IF NEW.cantidad_a_mover IS NOT NULL AND NEW.cantidad_a_mover > 0 THEN
        SET NEW.PPD32 = (valor * NEW.cantidad_a_mover);
    ELSE
        SET NEW.PPD32 = 0;
    END IF;
END //

DELIMITER ;
