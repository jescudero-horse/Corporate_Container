DELIMITER $$

CREATE TRIGGER `calcular_NC` 
BEFORE INSERT ON `EN_IFM_STANDARD` 
FOR EACH ROW 
BEGIN
    IF NEW.numero_cruces IS NOT NULL AND NEW.numero_cruces >= 0 AND NEW.cantidad_a_mover >= 0 THEN
        SET NEW.NC = (NEW.numero_cruces * NEW.cantidad_a_mover) + (6 * NEW.cantidad_a_mover);
    ELSE
        SET NEW.NC = 0;
    END IF;
END$$

DELIMITER ;
