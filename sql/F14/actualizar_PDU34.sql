DELIMITER //

CREATE TRIGGER actualizar_PDU34
BEFORE UPDATE ON EN_IFM_STANDARD
FOR EACH ROW
BEGIN
    DECLARE valor INT;

    IF NEW.machine_used = 2 THEN
        SET valor = 31;
    ELSEIF NEW.machine_used = 4 THEN
        SET valor = 28;
    ELSE
        SET valor = 0;
    END IF;

    IF NEW.cantidad_a_mover IS NOT NULL AND NEW.cantidad_a_mover > 0 THEN
        SET NEW.PDU34 = (valor * NEW.cantidad_a_mover);
    ELSE
        SET NEW.PDU34 = 0;
    END IF;
END //

DELIMITER ;
