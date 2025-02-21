DELIMITER //

CREATE TRIGGER actualizar_CDVBCDL
BEFORE UPDATE ON EN_IFM_STANDARD
FOR EACH ROW
BEGIN
    DECLARE valor INT;

    IF NEW.machine_used IN (4, 5, 6) THEN
        SET valor = 6;
    ELSEIF NEW.machine_used IN (1, 2) THEN
        SET valor = 4;
    ELSE
        SET valor = 0;
    END IF;

    IF NEW.numero_curvas IS NOT NULL AND NEW.cantidad_a_mover IS NOT NULL THEN
        SET NEW.CDVB_CDL = (NEW.numero_curvas * NEW.cantidad_a_mover) + valor;
    ELSE
        SET NEW.CDVB_CDL = valor;
    END IF;
END //

DELIMITER ;